import { useTranslations } from "next-intl";

import { BRAND_NAME } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      © {new Date().getFullYear()} {BRAND_NAME} — {t("tagline")}
    </footer>
  );
}
