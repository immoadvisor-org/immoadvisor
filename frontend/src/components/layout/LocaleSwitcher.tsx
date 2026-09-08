"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const FLAGS: Record<string, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Locale");
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(code: string) {
    setIsOpen(false);
    router.replace(pathname, { locale: code });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Language"
        aria-expanded={isOpen}
        className="text-xs font-medium uppercase text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        {locale}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {routing.locales.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 ${
                  code === locale
                    ? "font-medium text-brand-600 dark:text-brand-100"
                    : "text-slate-700 dark:text-neutral-200"
                }`}
              >
                <span>{FLAGS[code]}</span>
                {t(code)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
