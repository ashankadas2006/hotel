import { login, register } from "../../lib/actions";
import { bg } from "../../lib/img";
import { Msg, inp, btn, card } from "../../components/ui";
export default async function Login({ searchParams }) {
  const sp = await searchParams;
  return (
    <div className="max-w-4xl mx-auto"><Msg sp={sp} />
      <section className="hero mb-6 fade-up" style={bg(2, 0.6)}>
        <div className="px-6 py-10"><h1 className="text-3xl md:text-4xl font-extrabold">Welcome to StayEasy 👋</h1>
          <p className="mt-2 opacity-90">Log in to book rooms, or register as a hotel owner to list your property.</p></div>
      </section>
      <div className="grid md:grid-cols-2 gap-6">
        <form action={login} className={`${card} grid gap-3 content-start fade-up`}><h2 className="font-bold text-xl">🔑 Login</h2>
          <input name="email" type="email" placeholder="Email" required className={inp} />
          <input name="password" type="password" placeholder="Password" required className={inp} />
          <button className={btn}>Login</button>
          <p className="text-xs muted">Demo: guest@demo.com or owner@demo.com · password demo123</p></form>
        <form action={register} className={`${card} grid gap-3 content-start fade-up`} style={{ animationDelay: "80ms" }}><h2 className="font-bold text-xl">📝 Create account</h2>
          <input name="name" placeholder="Name" required className={inp} />
          <input name="email" type="email" placeholder="Email" required className={inp} />
          <input name="password" type="password" minLength={6} placeholder="Password (min 6)" required className={inp} />
          <select name="role" className={inp}><option value="CUSTOMER">I'm a Customer</option><option value="OWNER">I'm a Hotel Owner</option></select>
          <button className={btn}>Create account</button></form>
      </div>
    </div>
  );
}
