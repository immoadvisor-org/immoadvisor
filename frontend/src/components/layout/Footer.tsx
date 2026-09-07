import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      {t("copyright", { year: new Date().getFullYear() })}
    </footer>
  );
}
