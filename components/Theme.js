"use client";
import { useEffect, useState } from "react";
// Animated light/dark switch. Choice is saved in localStorage (t = "d" | "l").
export default function Theme() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const flip = () => {
    const d = document.documentElement.classList.toggle("dark");
    localStorage.t = d ? "d" : "l"; setDark(d);
  };
  return (
    <button onClick={flip} className="switch" title={dark ? "Switch to light" : "Switch to dark"} aria-label="Toggle light/dark theme">
      <span className="knob">{dark ? "🌙" : "☀️"}</span>
    </button>
  );
}
