"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Switches between light and dark. The choice is saved in a cookie so the server renders it. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const attr = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(attr ? attr === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    setDark(!dark);
  }

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} title="Toggle theme">
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
