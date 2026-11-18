import { redirect } from "next/navigation";
import { db } from "../../lib/db";
import { getUser } from "../../lib/auth";
import { cancelMine } from "../../lib/actions";
import { Msg, Badge, card } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function Bookings({ searchParams }) {
  const me = await getUser(), sp = await searchParams;
  if (me?.role !== "CUSTOMER") redirect("/login");
  const list = await db.booking.findMany({ where: { userId: me.id }, include: { room: { include: { hotel: true } } }, orderBy: { createdAt: "desc" } });
  const d = (x) => x.toISOString().slice(0, 10);
  return (
    <div className="grid gap-4 max-w-3xl mx-auto"><Msg sp={sp} /><h1 className="text-3xl font-extrabold">🧳 My bookings</h1>
      {!list.length && <div className={card}>No bookings yet. Find a hotel on the home page and book your first stay!</div>}
      {list.map((b) => (
        <div key={b.id} className={`${card} flex justify-between items-center gap-3 fade-up`}>
          <div><div className="font-bold text-lg">{b.room.hotel.name} <span className="muted font-normal text-sm">· {b.room.hotel.city}</span></div>
            <div className="text-sm muted">Room {b.room.name} ({b.room.type}) · {d(b.checkIn)} → {d(b.checkOut)}</div>
            <div className="mt-2 flex gap-2 items-center"><b style={{ color: "var(--accent)" }}>₹{b.total}</b><span className="chip">{b.paid ? "💳 Paid" : "Unpaid"}</span><Badge s={b.status} /></div></div>
          {b.status === "CONFIRMED" && <form action={cancelMine.bind(null, b.id)}><button className="btn-danger">Cancel</button></form>}
        </div>))}
    </div>
  );
}
