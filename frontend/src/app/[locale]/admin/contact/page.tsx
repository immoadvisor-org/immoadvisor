"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  listContactMessages,
  updateContactMessage,
  type ContactMessage,
  type ContactMessageStatus,
} from "@/features/admin/contactAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationEmailList } from "@/components/admin/NotificationEmailList";

const STATUSES: ContactMessageStatus[] = ["received", "contacted", "to_recontact", "completed"];

const STATUS_STYLES: Record<ContactMessageStatus, string> = {
  received: "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
  contacted: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  to_recontact: "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  completed: "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100",
};

export default function AdminContactPage() {
  const t = useTranslations("AdminContact");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    listContactMessages(accessToken)
      .then((data) => {
        setMessages(data);
        setNotesDraft(Object.fromEntries(data.map((m) => [m.id, m.notes ?? ""])));
      })
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

  async function handleStatusChange(messageId: string, status: ContactMessageStatus) {
    if (!accessToken) return;
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status } : m)));
    setError(null);
    try {
      await updateContactMessage(messageId, { status }, accessToken);
    } catch {
      setError(t("statusUpdateError"));
    }
  }

  async function handleNotesBlur(messageId: string) {
    if (!accessToken) return;
    const notes = notesDraft[messageId] ?? "";
    const original = messages.find((m) => m.id === messageId)?.notes ?? "";
    if (notes === original) return;

    setError(null);
    try {
      const updated = await updateContactMessage(messageId, { notes: notes || null }, accessToken);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    } catch {
      setError(t("statusUpdateError"));
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("messagesTitle")}</h1>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-50">{t("settingsTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{t("settingsSubtitle")}</p>
        <div className="mt-3">
          <NotificationEmailList purpose="contact" accessToken={accessToken} />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-50">{t("messagesTitle")}</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
        ) : messages.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">{t("noMessages")}</p>
        ) : (
          <div className="mt-3 divide-y divide-slate-100 dark:divide-neutral-800">
            {messages.map((message) => (
              <div key={message.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-neutral-50">
                    {message.first_name} {message.last_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                    <select
                      value={message.status}
                      onChange={(e) => handleStatusChange(message.id, e.target.value as ContactMessageStatus)}
                      className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[message.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`status.${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {message.email}
                  {message.phone ? ` · ${message.phone}` : ""}
                </p>
                {message.listing_reference && (
                  <span className="mt-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
                    {message.listing_reference}
                  </span>
                )}
                <p className="mt-2 text-sm text-slate-700 dark:text-neutral-300">{message.message}</p>

                <label className="mt-3 block text-xs font-medium text-slate-500 dark:text-neutral-400">
                  {t("notesLabel")}
                  <textarea
                    value={notesDraft[message.id] ?? ""}
                    onChange={(e) => setNotesDraft((prev) => ({ ...prev, [message.id]: e.target.value }))}
                    onBlur={() => handleNotesBlur(message.id)}
                    placeholder={t("notesPlaceholder")}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
