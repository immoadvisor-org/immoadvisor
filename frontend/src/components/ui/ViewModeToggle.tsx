"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export type ViewMode = "grid" | "list";

// Vista scelta dal singolo visitatore, ricordata tra una visita e l'altra
// (una chiave per pagina: annunci e servizi sono indipendenti).
export function useViewMode(storageKey: string): [ViewMode, (mode: ViewMode) => void] {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "grid" || saved === "list") setViewMode(saved);
    } catch {
      // Storage non disponibile (es. navigazione privata): resta la griglia.
    }
  }, [storageKey]);

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode);
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch {
      // Ignorato: la scelta vale comunque per la visita corrente.
    }
  }

  return [viewMode, changeViewMode];
}

function ViewModeIcon({ mode }: { mode: ViewMode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      {mode === "grid" ? (
        <>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
          <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
        </>
      ) : (
        <>
          <rect x="4" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="4" y="13.5" width="6" height="6" rx="1.5" />
          <path d="M13 6.5h7M13 9h4.5M13 15.5h7M13 18h4.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  const t = useTranslations("ViewMode");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex h-9 items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-800"
    >
      {(["grid", "list"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          aria-label={t(mode)}
          title={t(mode)}
          className={`flex h-full w-8 items-center justify-center rounded-md transition-colors ${
            value === mode
              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100"
              : "text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
          }`}
        >
          <ViewModeIcon mode={mode} />
        </button>
      ))}
    </div>
  );
}
