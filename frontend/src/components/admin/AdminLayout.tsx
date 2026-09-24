"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations("AdminNav");
  const pathname = usePathname();

  // "Lavoro quotidiano": quello che si controlla spesso (ordini/pagamenti,
  // messaggi, annunci da pubblicare o aggiornare). "Gestione sito":
  // contenuti e catalogo, che si toccano solo ogni tanto — separati per non dover scorrere tra le due cose ogni
  // giorno.
  const groups = [
    {
      label: t("dailyWorkGroup"),
      items: [
        { href: "/admin/orders", label: t("orders") },
        { href: "/admin/contact", label: t("contact") },
        { href: "/admin/listings", label: t("listings") },
      ],
    },
    {
      label: t("siteManagementGroup"),
      items: [
        { href: "/admin/services", label: t("services") },
        { href: "/admin/sales-packages", label: t("salesPackages") },
        { href: "/admin/home-layout", label: t("homeLayout") },
        { href: "/admin/about", label: t("about") },
        { href: "/admin/how-it-works", label: t("howItWorks") },
        { href: "/admin/legal", label: t("legal") },
        { href: "/admin/users", label: t("users") },
      ],
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row">
      <aside className="sm:w-48 sm:flex-shrink-0">
        <nav className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                {group.label}
              </p>
              <div className="mt-1 flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100"
                          : "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
