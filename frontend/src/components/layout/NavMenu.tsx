"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useListingsEnabled } from "@/features/listings/useListingsEnabled";

export function NavMenu() {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const [isOpen, setIsOpen] = useState(false);
  const listingsEnabled = useListingsEnabled();

  const links = [
    { href: "/", label: tNav("home") },
    { href: "/configuratore", label: tNav("configurator") },
    ...(listingsEnabled ? [{ href: "/annunci", label: tNav("listings") }] : []),
    { href: "/about", label: tNav("about") },
    { href: "/contact", label: tNav("contact") },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t("menu")}
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
