"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter, Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { useProfile } from "@/features/profile/useProfile";
import { supabase } from "@/features/auth/supabaseClient";
import { deleteMyAccount } from "@/features/auth/accountApi";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const t = useTranslations("Account");
  const router = useRouter();
  const { user, session, isLoading } = useUser();
  const isAdmin = useIsAdmin(user);
  const { profile } = useProfile(user);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (!session?.access_token) return;
    if (!window.confirm(t("deleteAccountConfirm"))) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(session.access_token);
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("deleteAccountError"));
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("email")}</p>
          <p className="text-slate-900 dark:text-slate-50">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("fullName")}</p>
          <p className="text-slate-900 dark:text-slate-50">
            {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("phone")}</p>
          <p className="text-slate-900 dark:text-slate-50">{profile?.phone || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("address")}</p>
          <p className="text-slate-900 dark:text-slate-50">
            {profile?.address_line || "—"}
            {profile?.postal_code || profile?.city ? (
              <>
                <br />
                {[profile?.postal_code, profile?.city].filter(Boolean).join(" ")}
              </>
            ) : null}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("canton")}</p>
          <p className="text-slate-900 dark:text-slate-50">{profile?.canton || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("avsNumber")}</p>
          <p className="text-slate-900 dark:text-slate-50">{profile?.avs_number || "—"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/account/orders" className="text-brand-600 hover:underline dark:text-brand-100">
            {t("myOrders")}
          </Link>
          {isAdmin && (
            <Link href="/admin/services" className="text-brand-600 hover:underline dark:text-brand-100">
              Admin
            </Link>
          )}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          {t("logout")}
        </Button>
      </div>

      <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">{t("deleteAccountTitle")}</h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{t("deleteAccountText")}</p>
        {deleteError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
        <Button
          variant="secondary"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="mt-3 border border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          {isDeleting ? t("deleteAccountLoading") : t("deleteAccountButton")}
        </Button>
      </div>
    </div>
  );
}
