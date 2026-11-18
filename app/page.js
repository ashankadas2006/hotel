import Link from "next/link";
import { db } from "../lib/db";
import { roomsFor } from "../lib/queries";
import { bg } from "../lib/img";
import { SearchBar, Stars, Msg, card } from "../components/ui";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const sp = await searchParams, q = sp.q || "";
  const hotels = await db.hotel.findMany({ where: { OR: [{ name: { contains: q } }, { city: { contains: q } }] }, include: { reviews: true } });
  const list = (await Promise.all(hotels.map(async (h) => ({ ...h, rooms: await roomsFor(h.id, sp) })))).filter((h) => h.rooms.length);
  const { msg, ...rest } = sp, qs = new URLSearchParams(rest).toString();
  return (
    <>
      <Msg sp={sp} />
      <section className="hero mb-8 fade-up" style={bg(0, 0.65)}>
        <div className="px-6 py-14 md:py-20 max-w-2xl">
          <span className="chip" style={{ color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>✨ Best price guarantee</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-4 leading-tight">Find your perfect stay</h1>
          <p className="mt-3 text-lg opacity-90">Search hotels, pick your dates, see live room availability and book in seconds.</p>
          <div className="flex flex-wrap gap-2 mt-6 text-sm">
            {["🛏️ Live availability", "💳 Easy payment", "⭐ Verified reviews", "🔒 Secure booking"].map((t) => <span key={t} className="chip" style={{ color: "#fff", background: "rgba(255,255,255,.15)", borderColor: "rgba(255,255,255,.25)" }}>{t}</span>)}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-4 gap-6">
        <SearchBar sp={sp} action="/" showQ />
        <section className="md:col-span-3 grid gap-5 content-start">
          <h2 className="text-2xl font-bold">{q || sp.from ? "Search results" : "Popular hotels"} <span className="text-base font-normal muted">({list.length})</span></h2>
          {!list.length && <div className={card}>😕 No hotels match. {sp.from && "Try other dates or filters."}</div>}
          <div className="grid sm:grid-cols-2 gap-5">
            {list.map((h, i) => {
              const avg = h.reviews.length ? h.reviews.reduce((s, r) => s + r.rating, 0) / h.reviews.length : 0;
              return (
                <Link key={h.id} href={`/hotel/${h.id}?${qs}`} className="glass hotel-card fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="overflow-hidden"><div className="pic flex items-end p-3" style={bg(h.id, 0.55)}>
                    <span className="chip" style={{ color: "#fff", background: "rgba(0,0,0,.35)", borderColor: "rgba(255,255,255,.25)" }}>📍 {h.city}</span>
                  </div></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2"><h3 className="text-lg font-bold">{h.name}</h3>
                      {avg > 0 ? <span className="text-sm whitespace-nowrap"><Stars r={avg} /> <span className="muted">({h.reviews.length})</span></span> : <span className="chip">New</span>}</div>
                    <p className="text-sm muted mt-1 line-clamp-2">{h.description}</p>
                    <div className="flex justify-between items-end mt-3">
                      <span className="text-xs muted">{h.rooms.length} room(s) available</span>
                      <span><span className="text-xs muted">from </span><b className="text-xl" style={{ color: "var(--accent)" }}>₹{h.rooms[0].price}</b><span className="text-xs muted">/night</span></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
