"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  ADMIN_SUBSCRIPTIONS,
  createAdmin,
  listAdmins,
  revokeAdmin,
  updateAdminSubscriptions,
  type AdminAccount,
  type AdminSubscription,
} from "@/features/admin/usersAdminApi";
import { ApiError } from "@/lib/apiClient";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/Button";

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";
const EMPTY_FORM = { email: "", password: "", first_name: "", last_name: "", phone: "" };
type FormField = keyof typeof EMPTY_FORM;

// Il backend risponde {"detail": "..."}: mostriamo solo il messaggio.
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    try {
      const detail = JSON.parse(err.message).detail;
      if (typeof detail === "string") return detail;
    } catch {
      // risposta non JSON
    }
  }
  return fallback;
}

function toggle(list: AdminSubscription[], value: AdminSubscription): AdminSubscription[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function AdminAdminsPage() {
  const t = useTranslations("AdminAdmins");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (accessToken) setAdmins(await listAdmins(accessToken));
  }, [accessToken]);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    reload().finally(() => setIsLoading(false));
  }, [isAdmin, accessToken, reload]);

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin || !accessToken) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-neutral-300">{tAdmin("accessDenied")}</p>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      const filled = Object.fromEntries(Object.entries(form).filter(([, value]) => value.trim() !== ""));
      const result = await createAdmin({ ...filled, email: form.email, subscriptions }, accessToken);
      setNotice(t(result.status === "created" ? "created" : "promoted", { email: form.email }));
      setForm(EMPTY_FORM);
      setSubscriptions([]);
      await reload();
    } catch (err) {
      setError(errorMessage(err, t("createError")));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleSubscription(target: AdminAccount, value: AdminSubscription) {
    if (!accessToken) return;
    const next = toggle(target.subscriptions, value);
    setError(null);
    setAdmins((prev) => prev.map((a) => (a.id === target.id ? { ...a, subscriptions: next } : a)));
    try {
      await updateAdminSubscriptions(target.id, next, accessToken);
    } catch (err) {
      setError(errorMessage(err, t("saveError")));
      await reload();
    }
  }

  async function handleRevoke(target: AdminAccount) {
    if (!accessToken) return;
    if (!window.confirm(t("revokeConfirm", { email: target.email ?? "" }))) return;
    setError(null);
    setNotice(null);
    try {
      await revokeAdmin(target.id, accessToken);
      await reload();
    } catch (err) {
      setError(errorMessage(err, t("revokeError")));
    }
  }

  function field(name: FormField, type = "text", required = false) {
    return (
      <label className="text-sm text-slate-700 dark:text-neutral-300">
        {t(`field.${name}`)}
        {required && " *"}
        <input
          type={type}
          required={required}
          autoComplete={name === "password" ? "new-password" : "off"}
          minLength={name === "password" ? 8 : undefined}
          value={form[name]}
          onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
          className={INPUT_CLASS}
        />
      </label>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="text-base font-medium text-slate-900 dark:text-neutral-50">{t("formTitle")}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{t("formHint")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("first_name")}
          {field("last_name")}
          {field("email", "email", true)}
          {field("phone", "tel")}
          {field("password", "password")}
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-slate-700 dark:text-neutral-300">{t("subscriptionsTitle")}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {ADMIN_SUBSCRIPTIONS.map((value) => (
              <label key={value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={subscriptions.includes(value)}
                  onChange={() => setSubscriptions((prev) => toggle(prev, value))}
                />
                {t(`subscription.${value}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit" className="mt-5" disabled={isSaving}>
          {isSaving ? t("saving") : t("submit")}
        </Button>
        {notice && <p className="mt-3 text-sm text-green-700 dark:text-green-400">{notice}</p>}
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="px-4 py-3">{t("columnName")}</th>
                <th className="px-4 py-3">{t("columnEmail")}</th>
                {ADMIN_SUBSCRIPTIONS.map((value) => (
                  <th key={value} className="px-4 py-3 text-center">
                    {t(`subscriptionShort.${value}`)}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-900 dark:text-neutral-50">
                    {[a.first_name, a.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-neutral-300">{a.email ?? "—"}</td>
                  {ADMIN_SUBSCRIPTIONS.map((value) => (
                    <td key={value} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        aria-label={t(`subscription.${value}`)}
                        checked={a.subscriptions.includes(value)}
                        onChange={() => handleToggleSubscription(a, value)}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    {a.id === user.id ? (
                      <span className="text-xs text-slate-400 dark:text-neutral-500">{t("you")}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRevoke(a)}
                        className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        {t("revoke")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
