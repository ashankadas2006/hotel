// Signed httpOnly cookie session (HMAC). Set SECRET in .env for production.
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "./db";
const sign = (v) => crypto.createHmac("sha256", process.env.SECRET || "dev-secret").update(v).digest("hex");
export async function setSession(id) { (await cookies()).set("s", `${id}.${sign(String(id))}`, { httpOnly: true, path: "/", sameSite: "lax" }); }
export async function clearSession() { (await cookies()).delete("s"); }
export async function getUser() {
  const c = (await cookies()).get("s")?.value; if (!c) return null;
  const [id, sig] = c.split("."); if (sign(id) !== sig) return null;
  return db.user.findUnique({ where: { id: +id } });
}
