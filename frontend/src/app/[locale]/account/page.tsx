"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useRouter, Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { supabase } from "@/features/auth/supabaseClient";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const t = useTranslations("Account");
  const router = useRouter();
  const { user, isLoading } = useUser();
  const isAdmin = useIsAdmin(user);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <p className="text-sm text-slate-500">{t("loading")}</p>;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-medium text-slate-900">{t("title")}</h1>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">{t("email")}</p>
        <p className="text-slate-900">{user.email}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/account/orders" className="text-brand-600 hover:underline">
            {t("myOrders")}
          </Link>
          {isAdmin && (
            <Link href="/admin/services" className="text-brand-600 hover:underline">
              Admin
            </Link>
          )}
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}
