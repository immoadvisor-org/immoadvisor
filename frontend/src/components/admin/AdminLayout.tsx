"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations("AdminNav");
  const pathname = usePathname();

  const items = [
    { href: "/admin/services", label: t("services") },
    { href: "/admin/listings", label: t("listings") },
    { href: "/admin/orders", label: t("orders") },
    { href: "/admin/users", label: t("users") },
    { href: "/admin/about", label: t("about") },
    { href: "/admin/how-it-works", label: t("howItWorks") },
    { href: "/admin/contact", label: t("contact") },
    { href: "/admin/legal", label: t("legal") },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row">
      <aside className="sm:w-48 sm:flex-shrink-0">
        <nav className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100"
                    : "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
