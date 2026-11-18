"use server";
import { db } from "./db";
import { getUser, setSession, clearSession } from "./auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const go = (p, m) => redirect(`${p}${p.includes("?") ? "&" : "?"}msg=${encodeURIComponent(m)}`);
const need = async (role) => { const u = await getUser(); if (!u || (role && u.role !== role)) redirect("/login"); return u; };

// ---- Auth ----
export async function register(f) {
  const email = f.get("email").toLowerCase();
  if (await db.user.findUnique({ where: { email } })) go("/login", "Email already registered");
  const u = await db.user.create({ data: { name: f.get("name"), email, password: await bcrypt.hash(f.get("password"), 10), role: f.get("role") === "OWNER" ? "OWNER" : "CUSTOMER" } });
  await setSession(u.id); redirect(u.role === "OWNER" ? "/admin" : "/");
}
export async function login(f) {
  const u = await db.user.findUnique({ where: { email: f.get("email").toLowerCase() } });
  if (!u || !(await bcrypt.compare(f.get("password"), u.password))) go("/login", "Invalid credentials");
  await setSession(u.id); redirect(u.role === "OWNER" ? "/admin" : "/");
}
export async function logout() { await clearSession(); redirect("/"); }

// ---- Booking + mock payment ----
export async function bookRoom(f) {
  const u = await need("CUSTOMER");
  const roomId = +f.get("roomId"), from = new Date(f.get("from")), to = new Date(f.get("to")), back = f.get("back");
  const nights = Math.round((to - from) / 864e5), card = f.get("card").replace(/\s/g, "");
  if (!(nights > 0)) go(back, "Pick valid dates");
  const room = await db.room.findUnique({ where: { id: roomId } });
  const clash = await db.booking.count({ where: { roomId, status: { not: "CANCELLED" }, checkIn: { lt: to }, checkOut: { gt: from } } });
  if (clash) go(back, "Room no longer available");
  if (!/^\d{16}$/.test(card) || card.startsWith("0")) go(back, "Payment declined (mock: use 16 digits, not starting with 0)");
  await db.booking.create({ data: { userId: u.id, roomId, checkIn: from, checkOut: to, total: nights * room.price, paid: true } });
  go("/bookings", "Payment successful, booking confirmed");
}
export async function cancelMine(id) {
  const u = await need("CUSTOMER");
  await db.booking.updateMany({ where: { id, userId: u.id }, data: { status: "CANCELLED" } });
  revalidatePath("/bookings");
}

// ---- Reviews (only guests who booked that hotel) ----
export async function addReview(f) {
  const u = await need("CUSTOMER"), hotelId = +f.get("hotelId"), back = `/hotel/${hotelId}`;
  if (!(await db.booking.count({ where: { userId: u.id, room: { hotelId } } }))) go(back, "Only guests who booked can review");
  await db.review.create({ data: { userId: u.id, hotelId, rating: Math.min(5, Math.max(1, +f.get("rating"))), comment: f.get("comment") } });
  go(back, "Review posted");
}

// ---- Owner admin (every mutation is scoped to the owner's own hotels) ----
export async function saveHotel(f) {
  const u = await need("OWNER");
  await db.hotel.create({ data: { name: f.get("name"), city: f.get("city"), description: f.get("description") || "", ownerId: u.id } });
  revalidatePath("/admin");
}
export async function saveRoom(f) {
  const u = await need("OWNER"), hotelId = +f.get("hotelId");
  if (!(await db.hotel.count({ where: { id: hotelId, ownerId: u.id } }))) redirect("/admin");
  await db.room.create({ data: { hotelId, name: f.get("name"), type: f.get("type"), price: +f.get("price"), ac: f.get("ac") === "on", capacity: +f.get("capacity") || 2 } });
  revalidatePath("/admin");
}
export async function deleteHotel(id) { const u = await need("OWNER"); await db.hotel.deleteMany({ where: { id, ownerId: u.id } }); revalidatePath("/admin"); }
export async function deleteRoom(id) { const u = await need("OWNER"); await db.room.deleteMany({ where: { id, hotel: { ownerId: u.id } } }); revalidatePath("/admin"); }
export async function setStatus(id, status) { const u = await need("OWNER"); await db.booking.updateMany({ where: { id, room: { hotel: { ownerId: u.id } } }, data: { status } }); revalidatePath("/admin"); }
export async function deleteGuest(id) {
  const u = await need("OWNER");
  await db.user.deleteMany({ where: { id, role: "CUSTOMER", bookings: { some: { room: { hotel: { ownerId: u.id } } } } } });
  revalidatePath("/admin");
}
