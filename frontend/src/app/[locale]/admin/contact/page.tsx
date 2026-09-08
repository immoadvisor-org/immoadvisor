"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  getContactSettings,
  listContactMessages,
  updateContactSettings,
  type ContactMessage,
} from "@/features/admin/contactAdminApi";
import { Button } from "@/components/ui/Button";

export default function AdminContactPage() {
  const t = useTranslations("AdminContact");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [notificationEmail, setNotificationEmail] = useState("");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    Promise.all([getContactSettings(accessToken), listContactMessages(accessToken)])
      .then(([settings, msgs]) => {
        setNotificationEmail(settings.notification_email ?? "");
        setMessages(msgs);
      })
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-slate-300">{tAdmin("accessDenied")}</p>
    );
  }

  async function handleSave() {
    if (!accessToken) return;
    setIsSaving(true);
    setSaveState("idle");
    try {
      await updateContactSettings(notificationEmail.trim() || null, accessToken);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("messagesTitle")}</h1>
        <Link href="/admin/services" className="text-sm text-brand-600 hover:underline dark:text-brand-100">
          {t("catalogLink")} →
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{t("settingsTitle")}</h2>
        <label className="mt-3 block text-sm text-slate-700 dark:text-slate-300" htmlFor="notificationEmail">
          {t("notificationEmailLabel")}
          <input
            id="notificationEmail"
            type="email"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            className="mt-1 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {t("save")}
          </Button>
          {saveState === "saved" && <span className="text-sm text-brand-600 dark:text-brand-100">{t("saved")}</span>}
          {saveState === "error" && <span className="text-sm text-red-600 dark:text-red-400">{t("saveError")}</span>}
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
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{message.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
