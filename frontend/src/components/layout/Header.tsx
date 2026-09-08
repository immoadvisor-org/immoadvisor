"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { BRAND_NAME } from "@/lib/constants";
import { useUser } from "@/features/auth/useUser";
import { useCartStore } from "@/features/cart/cartStore";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { NavMenu } from "@/components/layout/NavMenu";
import { UserMenu } from "@/components/layout/UserMenu";

export function Header() {
  const t = useTranslations("Header");
  const { user } = useUser();
  const itemCount = useCartStore((state) => state.items.length);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-baseline gap-1.5">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-50"
          >
            {BRAND_NAME}
          </Link>
          <LocaleSwitcher />
        </div>

        <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300 sm:gap-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-50">
              {t("login")}
            </Link>
          )}
          <button
            type="button"
            onClick={toggleDrawer}
            aria-label={t("cart")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-slate-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
              <path d="M6 6L4.5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9.5" cy="19" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17.5" cy="19" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </button>
          <NavMenu />
        </nav>
      </div>
    </header>
  );
}
