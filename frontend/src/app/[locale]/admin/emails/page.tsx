"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  EMAIL_TEMPLATE_GROUPS,
  listAdminEmailTemplates,
  type EmailTemplateAdmin,
} from "@/features/admin/emailsAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminEmailsPage() {
  const t = useTranslations("AdminEmails");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [templates, setTemplates] = useState<EmailTemplateAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    listAdminEmailTemplates(accessToken)
      .then(setTemplates)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin || !accessToken) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-neutral-300">{tAdmin("accessDenied")}</p>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
      ) : loadError ? (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">{t("loadError")}</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {EMAIL_TEMPLATE_GROUPS.map((group) => {
            const items = templates.filter((template) => template.group === group);
            if (items.length === 0) return null;
            return (
              <section key={group}>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
                  {t(`groups.${group}`)}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{t(`groupDescriptions.${group}`)}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {items.map((template) => (
                    <Link
                      key={template.key}
                      href={`/admin/emails/${template.key}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-500"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-slate-900 dark:text-neutral-50">
                          {t(`templates.${template.key}.name`)}
                        </p>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs ${
                            template.is_customized
                              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100"
                              : "bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"
                          }`}
                        >
                          {template.is_customized ? t("customized") : t("default")}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
                        {t(`templates.${template.key}.description`)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
