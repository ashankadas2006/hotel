import { notFound } from "next/navigation";
import { db } from "../../../lib/db";
import { getUser } from "../../../lib/auth";
import { roomsFor } from "../../../lib/queries";
import { bookRoom, addReview } from "../../../lib/actions";
import { bg } from "../../../lib/img";
import { SearchBar, Heatmap, Stars, Msg, inp, btn, card } from "../../../components/ui";

export const dynamic = "force-dynamic";
const icon = { Single: "🛏️", Double: "🛌", Deluxe: "🌟", Suite: "👑" };

export default async function Hotel({ params, searchParams }) {
  const { id } = await params, sp = await searchParams, me = await getUser();
  const hotel = await db.hotel.findUnique({ where: { id: +id }, include: {
    reviews: { include: { user: true }, orderBy: { createdAt: "desc" } },
    rooms: { include: { bookings: { where: { status: { not: "CANCELLED" } } } } } } });
  if (!hotel) notFound();
  const rooms = await roomsFor(hotel.id, sp), { msg, ...rest } = sp;
  const back = `/hotel/${id}?${new URLSearchParams(rest)}`, hasDates = sp.from && sp.to;
  const avg = hotel.reviews.length ? hotel.reviews.reduce((s, r) => s + r.rating, 0) / hotel.reviews.length : 0;
  return (
    <>
      <Msg sp={sp} />
      <section className="hero mb-6 fade-up" style={bg(hotel.id, 0.7)}>
        <div className="px-6 py-14 md:py-20">
          <span className="chip" style={{ color: "#fff", background: "rgba(255,255,255,.15)", borderColor: "rgba(255,255,255,.3)" }}>📍 {hotel.city}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-3">{hotel.name}</h1>
          <p className="mt-2 opacity-90 max-w-xl">{hotel.description}</p>
          {avg > 0 && <p className="mt-3"><Stars r={avg} /> <span className="opacity-80 text-sm">{avg.toFixed(1)} · {hotel.reviews.length} review(s)</span></p>}
        </div>
      </section>
      <div className="grid md:grid-cols-4 gap-6">
        <SearchBar sp={sp} action={`/hotel/${id}`} />
        <section className="md:col-span-3 grid gap-4 content-start">
          <div className={card}><h3 className="font-bold mb-3">📅 Occupancy, next 30 days</h3>
            <Heatmap total={hotel.rooms.length} bookings={hotel.rooms.flatMap((r) => r.bookings)} /></div>
          <h3 className="text-xl font-bold mt-2">{hasDates ? `Available ${sp.from} → ${sp.to}` : "Rooms"} {!hasDates && <span className="text-sm font-normal muted">· pick dates on the left to see live availability and book</span>}</h3>
          {!rooms.length && <div className={card}>😕 No rooms match these dates or filters.</div>}
          {rooms.map((r) => (
            <div key={r.id} className={`${card} flex flex-wrap justify-between items-center gap-4 fade-up`}>
              <div className="flex gap-4 items-center">
                <div className="text-4xl">{icon[r.type] || "🛏️"}</div>
                <div><div className="font-bold text-lg">Room {r.name} · {r.type}</div>
                  <div className="flex gap-2 mt-1 flex-wrap"><span className="chip">{r.ac ? "❄️ AC" : "🌬️ Non-AC"}</span><span className="chip">👥 sleeps {r.capacity}</span></div></div>
              </div>
              <div className="text-right"><div><b className="text-2xl" style={{ color: "var(--accent)" }}>₹{r.price}</b><span className="text-sm muted"> /night</span></div>
                {hasDates && (me?.role === "CUSTOMER" ? (
                  <form action={bookRoom} className="flex gap-2 items-center mt-2 flex-wrap justify-end">
                    <input type="hidden" name="roomId" value={r.id} /><input type="hidden" name="from" value={sp.from} />
                    <input type="hidden" name="to" value={sp.to} /><input type="hidden" name="back" value={back} />
                    <input name="card" placeholder="💳 16-digit card (mock)" required className={inp + " !w-52"} /><button className={btn}>Pay & Book</button>
                  </form>) : <a href="/login" className="btn inline-block mt-2">Login as customer to book</a>)}
              </div>
            </div>
          ))}
          <h3 className="text-xl font-bold mt-4">⭐ Guest reviews</h3>
          {me?.role === "CUSTOMER" && (
            <form action={addReview} className={`${card} grid gap-2`}><input type="hidden" name="hotelId" value={hotel.id} />
              <select name="rating" className={inp}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}</select>
              <textarea name="comment" required placeholder="Share your experience (only guests who booked can review)" className={inp} /><button className={btn}>Post review</button></form>)}
          {!hotel.reviews.length && <p className="muted">No reviews yet.</p>}
          {hotel.reviews.map((r) => <div key={r.id} className={card}><div className="flex justify-between"><b>{r.user.name}</b><Stars r={r.rating} /></div><p className="mt-1 muted">{r.comment}</p></div>)}
        </section>
      </div>
    </>
  );
}
