"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { EMAIL_TEMPLATE_GROUPS, type EmailTemplateAdmin } from "@/features/admin/emailsAdminApi";

interface EmailTemplatesNavProps {
  templates: EmailTemplateAdmin[];
  activeKey?: string;
}

// Elenco delle sottosezioni della pagina Email, raggruppate per tipologia:
// usato sia nella panoramica sia accanto all'editor del singolo modello.
export function EmailTemplatesNav({ templates, activeKey }: EmailTemplatesNavProps) {
  const t = useTranslations("AdminEmails");

  return (
    <nav className="flex flex-col gap-5">
      {EMAIL_TEMPLATE_GROUPS.map((group) => {
        const items = templates.filter((template) => template.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-500">
              {t(`groups.${group}`)}
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {items.map((template) => {
                const isActive = template.key === activeKey;
                return (
                  <Link
                    key={template.key}
                    href={`/admin/emails/${template.key}`}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? "bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-100"
                        : "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>{t(`templates.${template.key}.name`)}</span>
                    {template.is_customized && (
                      <span
                        className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500"
                        title={t("customized")}
                        aria-label={t("customized")}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
