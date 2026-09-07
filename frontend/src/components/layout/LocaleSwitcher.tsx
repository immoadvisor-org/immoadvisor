"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent } from "react";

import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Locale");
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    router.replace(pathname, { locale: event.target.value });
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      aria-label="Language"
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
    >
      {routing.locales.map((code) => (
        <option key={code} value={code}>
          {t(code)}
        </option>
      ))}
    </select>
  );
}
