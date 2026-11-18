import { redirect } from "next/navigation";
import { db } from "../../lib/db";
import { getUser } from "../../lib/auth";
import { saveHotel, saveRoom, deleteHotel, deleteRoom, setStatus, deleteGuest } from "../../lib/actions";
import { inp, btn, card, Badge } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const me = await getUser();
  if (me?.role !== "OWNER") redirect("/login");
  const mine = { room: { hotel: { ownerId: me.id } } };
  const hotels = await db.hotel.findMany({ where: { ownerId: me.id }, include: { rooms: true } });
  const bookings = await db.booking.findMany({ where: mine, include: { user: true, room: { include: { hotel: true } } }, orderBy: { createdAt: "desc" } });
  const guests = await db.user.findMany({ where: { role: "CUSTOMER", bookings: { some: mine } } });
  const revenue = bookings.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.total, 0);
  const d = (x) => x.toISOString().slice(0, 10);
  return (
    <div className="grid gap-8">
      <h1 className="text-3xl font-extrabold">📊 Owner dashboard</h1>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[["🏨 Hotels", hotels.length], ["🧾 Bookings", bookings.length], ["💰 Revenue", `₹${revenue}`]].map(([k, v]) => <div key={k} className={card}><div className="text-sm muted">{k}</div><div className="text-3xl font-extrabold logo">{v}</div></div>)}
      </div>

      <section className="grid gap-4"><h2 className="text-xl font-bold">Hotels & rooms</h2>
        <form action={saveHotel} className={`${card} grid md:grid-cols-4 gap-2`}>
          <input name="name" placeholder="Hotel name" required className={inp} /><input name="city" placeholder="City" required className={inp} />
          <input name="description" placeholder="Description" className={inp} /><button className={btn}>+ Add hotel</button></form>
        {hotels.map((h) => (
          <div key={h.id} className={card}>
            <div className="flex justify-between items-center mb-2"><b className="text-lg">{h.name} <span className="muted font-normal text-sm">· {h.city}</span></b><form action={deleteHotel.bind(null, h.id)}><button className="btn-danger">Delete hotel</button></form></div>
            {h.rooms.map((r) => <div key={r.id} className="flex justify-between items-center text-sm py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span>Room {r.name} · {r.type} · {r.ac ? "❄️ AC" : "🌬️ Non-AC"} · {r.capacity} guests · <b>₹{r.price}</b></span>
              <form action={deleteRoom.bind(null, r.id)}><button className="btn-danger">Remove</button></form></div>)}
            <form action={saveRoom} className="grid grid-cols-2 md:grid-cols-7 gap-2 mt-3 items-center">
              <input type="hidden" name="hotelId" value={h.id} /><input name="name" placeholder="Room no." required className={inp} />
              <select name="type" className={inp}>{["Single", "Double", "Deluxe", "Suite"].map((t) => <option key={t}>{t}</option>)}</select>
              <input name="price" type="number" placeholder="₹/night" required className={inp} /><input name="capacity" type="number" placeholder="Guests" className={inp} />
              <label className="text-sm"><input type="checkbox" name="ac" defaultChecked /> AC</label><button className={btn + " md:col-span-2"}>+ Add room</button></form>
          </div>))}
      </section>

      <section className="grid gap-2"><h2 className="text-xl font-bold">Bookings</h2>
        {!bookings.length && <div className={card}>No bookings yet.</div>}
        {bookings.map((b) => (
          <div key={b.id} className={`${card} flex justify-between items-center gap-3 text-sm`}>
            <span>#{b.id} <b>{b.user.name}</b> · {b.room.hotel.name} Room {b.room.name} · {d(b.checkIn)} → {d(b.checkOut)} · ₹{b.total} <Badge s={b.status} /></span>
            <form action={setStatus.bind(null, b.id, b.status === "CANCELLED" ? "CONFIRMED" : "CANCELLED")}><button className="btn-ghost">{b.status === "CANCELLED" ? "Restore" : "Cancel"}</button></form>
          </div>))}
      </section>

      <section className="grid gap-2"><h2 className="text-xl font-bold">Guests</h2>
        {!guests.length && <div className={card}>No guests yet.</div>}
        {guests.map((g) => <div key={g.id} className={`${card} flex justify-between items-center text-sm`}><span><b>{g.name}</b> · {g.email}</span>
          <form action={deleteGuest.bind(null, g.id)}><button className="btn-danger">Remove user</button></form></div>)}
      </section>
    </div>
  );
}
