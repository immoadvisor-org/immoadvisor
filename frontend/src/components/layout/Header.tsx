"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export function Header() {
  const t = useTranslations("Header");
  const { user } = useUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-medium text-slate-900">
          {t("siteTitle")}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {user ? (
            <Link href="/account" className="hover:text-slate-900">
              {t("account")}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-slate-900">
              {t("login")}
            </Link>
          )}
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
