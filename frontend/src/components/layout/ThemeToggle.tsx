"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // localStorage non disponibile (es. private browsing): il tema resta solo per la sessione corrente.
  }
}

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  if (!mounted) return null;

  function setAndApply(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-md dark:border-slate-700 dark:bg-slate-800 sm:bottom-6">
      <button
        type="button"
        onClick={() => setAndApply("light")}
        aria-label={t("toLight")}
        aria-pressed={theme === "light"}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          theme === "light" ? "bg-brand-500 text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setAndApply("dark")}
        aria-label={t("toDark")}
        aria-pressed={theme === "dark"}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          theme === "dark" ? "bg-brand-500 text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
        </svg>
      </button>
    </div>
  );
}
