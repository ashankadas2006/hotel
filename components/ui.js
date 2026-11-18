import Link from "next/link";
import { getUser } from "../lib/auth";
import { logout } from "../lib/actions";
import Theme from "./Theme";

export const inp = "field";
export const btn = "btn";
export const card = "glass p-5";
export const Stars = ({ r }) => <span className="text-amber-400 tracking-wide">{"★".repeat(Math.round(r))}<span className="opacity-40">{"★".repeat(5 - Math.round(r))}</span></span>;
export const Msg = ({ sp }) => sp.msg ? <p className="glass fade-up mb-4 px-4 py-3 border-l-4" style={{ borderLeftColor: "var(--accent)" }}>✨ {sp.msg}</p> : null;
export const Badge = ({ s }) => <span className={`badge ${s === "CANCELLED" ? "badge-bad" : "badge-ok"}`}>{s}</span>;

export async function Nav() {
  const u = await getUser();
  return (
    <nav className="glass-nav sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex gap-3 items-center px-4 py-3">
        <Link href="/" className="logo font-extrabold text-xl">🏨 StayEasy</Link><span className="flex-1" />
        {u?.role === "CUSTOMER" && <Link href="/bookings" className="btn-ghost">My bookings</Link>}
        {u?.role === "OWNER" && <Link href="/admin" className="btn-ghost">Dashboard</Link>}
        {u ? <form action={logout}><button className="btn-ghost">Logout ({u.name})</button></form> : <Link href="/login" className="btn">Login / Register</Link>}
        <Theme />
      </div>
    </nav>
  );
}

// Search bar + filter sidebar in one GET form (state lives in the URL)
export function SearchBar({ sp, action, showQ }) {
  return (
    <form action={action} className={`${card} grid gap-3 content-start md:sticky md:top-20`}>
      <h3 className="font-bold">🔎 Search & filters</h3>
      {showQ && <input name="q" defaultValue={sp.q} placeholder="City or hotel name" className={inp} />}
      <label className="text-sm muted">Check-in<input type="date" name="from" defaultValue={sp.from} className={inp} /></label>
      <label className="text-sm muted">Check-out<input type="date" name="to" defaultValue={sp.to} className={inp} /></label>
      <label className="text-sm muted">Max price/night (₹)<input type="number" name="max" defaultValue={sp.max} placeholder="e.g. 4000" className={inp} /></label>
      <select name="ac" defaultValue={sp.ac || ""} className={inp}><option value="">AC / Non-AC</option><option value="1">❄️ AC</option><option value="0">🌬️ Non-AC</option></select>
      <select name="type" defaultValue={sp.type || ""} className={inp}><option value="">Any room type</option>{["Single", "Double", "Deluxe", "Suite"].map((t) => <option key={t}>{t}</option>)}</select>
      <button className={btn}>Search</button>
    </form>
  );
}

// Server-rendered 30-day occupancy heatmap: darker red = fuller hotel
export function Heatmap({ total, bookings }) {
  const days = [...Array(30)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
  return (
    <>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((d) => {
          const n = bookings.filter((b) => b.checkIn <= d && b.checkOut > d).length;
          return <div key={+d} title={`${d.toDateString()}: ${n}/${total} rooms booked`}
            style={{ background: n ? `rgba(239,68,68,${0.25 + 0.75 * (total ? n / total : 0)})` : "rgba(16,185,129,.22)" }}
            className="h-10 rounded-lg text-[11px] flex items-center justify-center font-medium">{d.getDate()}</div>;
        })}
      </div>
      <p className="text-xs muted mt-2">🟩 free &nbsp;·&nbsp; 🟥 booked (darker = fuller). Hover a day for details.</p>
    </>
  );
}
