"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { listContactMessages, type ContactMessage } from "@/features/admin/contactAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationEmailList } from "@/components/admin/NotificationEmailList";

export default function AdminContactPage() {
  const t = useTranslations("AdminContact");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    listContactMessages(accessToken)
      .then(setMessages)
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin || !accessToken) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-slate-300">{tAdmin("accessDenied")}</p>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("messagesTitle")}</h1>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t("settingsTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("settingsSubtitle")}</p>
        <div className="mt-3">
          <NotificationEmailList purpose="contact" accessToken={accessToken} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t("messagesTitle")}</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>
        ) : messages.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t("noMessages")}</p>
        ) : (
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {messages.map((message) => (
              <div key={message.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {message.first_name} {message.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {message.email}
                  {message.phone ? ` · ${message.phone}` : ""}
                </p>
                {message.listing_reference && (
                  <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
                    {message.listing_reference}
                  </span>
                )}
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{message.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
