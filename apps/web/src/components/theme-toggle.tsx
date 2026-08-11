"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label="切换显示模式" title="切换显示模式">
      <Sun className="theme-sun" size={18} />
      <Moon className="theme-moon" size={18} />
    </button>
  );
}
