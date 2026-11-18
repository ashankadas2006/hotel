import "./globals.css";
import { Nav } from "../components/ui";
export const metadata = { title: "StayEasy – Book your perfect stay" };
// Runs before paint so there is no light/dark flash. Falls back to the OS preference.
const init = "try{var t=localStorage.t;document.documentElement.classList.toggle('dark',t?t==='d':matchMedia('(prefers-color-scheme: dark)').matches)}catch(e){}";
export default function Root({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: init }} /></head>
      <body className="app">
        <Nav />
        <main className="max-w-6xl mx-auto p-4 pb-16">{children}</main>
        <footer className="text-center text-sm muted pb-8">© StayEasy · Find it. Book it. Enjoy it.</footer>
      </body>
    </html>
  );
}
