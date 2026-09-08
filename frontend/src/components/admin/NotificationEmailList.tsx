"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import {
  addNotificationRecipient,
  listNotificationRecipients,
  removeNotificationRecipient,
  type NotificationPurpose,
  type NotificationRecipient,
} from "@/features/admin/notificationsAdminApi";
import { Button } from "@/components/ui/Button";

interface NotificationEmailListProps {
  purpose: NotificationPurpose;
  accessToken: string;
}

export function NotificationEmailList({ purpose, accessToken }: NotificationEmailListProps) {
  const t = useTranslations("NotificationEmails");
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    listNotificationRecipients(purpose, accessToken)
      .then(setRecipients)
      .finally(() => setIsLoading(false));
  }, [purpose, accessToken]);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    const email = newEmail.trim();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const recipient = await addNotificationRecipient(purpose, email, accessToken);
      setRecipients((prev) =>
        prev.some((r) => r.id === recipient.id) ? prev : [...prev, recipient].sort((a, b) => a.email.localeCompare(b.email))
      );
      setNewEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("addError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    try {
      await removeNotificationRecipient(id, accessToken);
    } catch {
      listNotificationRecipients(purpose, accessToken).then(setRecipients);
    }
  }

  return (
    <div>
      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
      ) : (
        <>
          {recipients.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-neutral-400">{t("empty")}</p>
          ) : (
            <ul className="space-y-1">
              {recipients.map((recipient) => (
                <li
                  key={recipient.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {recipient.email}
                  <button
                    type="button"
                    onClick={() => handleRemove(recipient.id)}
                    aria-label={t("remove")}
                    className="text-slate-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAdd} className="mt-3 flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("addPlaceholder")}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <Button type="submit" variant="secondary" disabled={isSubmitting}>
              {t("add")}
            </Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </>
      )}
    </div>
  );
}
