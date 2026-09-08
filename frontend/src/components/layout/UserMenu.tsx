"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";

import { Link, useRouter } from "@/i18n/navigation";
import { supabase } from "@/features/auth/supabaseClient";
import { useIsAdmin } from "@/features/profile/useIsAdmin";

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations("Header");
  const tAccount = useTranslations("Account");
  const router = useRouter();
  const isAdmin = useIsAdmin(user);
  const [isOpen, setIsOpen] = useState(false);

  const firstName = (user.user_metadata?.first_name as string | undefined)?.trim();
  const lastName = (user.user_metadata?.last_name as string | undefined)?.trim();
  const displayName = firstName ? [firstName, lastName].filter(Boolean).join(" ") : user.email;

  async function handleLogout() {
    setIsOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={displayName}
        title={displayName}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-slate-800"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            <div className="truncate border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-900 dark:border-neutral-800 dark:text-neutral-50">
              {displayName}
            </div>
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-200 dark:hover:bg-slate-800"
            >
              {t("account")}
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-200 dark:hover:bg-slate-800"
            >
              {tAccount("myOrders")}
            </Link>
            {isAdmin && (
              <Link
                href="/admin/services"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-200 dark:hover:bg-slate-800"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-200 dark:hover:bg-slate-800"
            >
              {tAccount("logout")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
