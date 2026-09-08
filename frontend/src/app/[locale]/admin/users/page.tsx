"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { deleteAdminUser, listAdminUsers, type AdminProfile } from "@/features/admin/usersAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DeleteIcon, ICON_BUTTON_DANGER_CLASS } from "@/components/admin/icons";

export default function AdminUsersPage() {
  const t = useTranslations("AdminUsers");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    listAdminUsers(accessToken)
      .then(setUsers)
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

  async function handleDelete(target: AdminProfile) {
    if (!accessToken) return;
    if (!window.confirm(t("deleteConfirm", { email: target.email ?? "" }))) return;

    setError(null);
    setUsers((prev) => prev.filter((u) => u.id !== target.id));
    try {
      await deleteAdminUser(target.id, accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteError"));
      listAdminUsers(accessToken).then(setUsers);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("subtitle")}</p>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">{t("noUsers")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-4 py-3">{t("columnName")}</th>
                <th className="px-4 py-3">{t("columnEmail")}</th>
                <th className="px-4 py-3">{t("columnPhone")}</th>
                <th className="px-4 py-3">{t("columnAddress")}</th>
                <th className="px-4 py-3">{t("columnRegisteredAt")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-50">
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                    {u.is_admin && (
                      <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
                        {t("adminBadge")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {[u.address_line, u.postal_code, u.city, u.canton].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!u.is_admin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u)}
                        aria-label={t("delete")}
                        title={t("delete")}
                        className={ICON_BUTTON_DANGER_CLASS}
                      >
                        <DeleteIcon />
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
