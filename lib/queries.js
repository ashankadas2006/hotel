// search + filters + real-time availability in ONE query
import { db } from "./db";
export async function roomsFor(hotelId, sp) {
  const { from, to, max, ac, type } = sp, where = { hotelId };
  if (max) where.price = { lte: +max };
  if (ac) where.ac = ac === "1";
  if (type) where.type = type;
  if (from && to) where.bookings = { none: { status: { not: "CANCELLED" }, checkIn: { lt: new Date(to) }, checkOut: { gt: new Date(from) } } };
  return db.room.findMany({ where, orderBy: { price: "asc" } });
}
