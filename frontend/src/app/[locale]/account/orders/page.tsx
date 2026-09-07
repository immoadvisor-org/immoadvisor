"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useOrders } from "@/features/orders/useOrders";
import { PriceTag } from "@/components/ui/PriceTag";

export default function OrdersPage() {
  const t = useTranslations("Orders");
  const router = useRouter();
  const { user, session, isLoading: isLoadingUser } = useUser();
  const { orders, isLoading: isLoadingOrders, error } = useOrders(session?.access_token);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/login");
    }
  }, [isLoadingUser, user, router]);

  if (isLoadingUser || isLoadingOrders) {
    return <p className="text-sm text-slate-500">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{t("error", { error })}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-medium text-slate-900">{t("title")}</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-slate-600">{t("empty")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {t(`status.${order.status}`)}
                </span>
              </div>

              <ul className="mt-3 space-y-1">
                {order.items.map((item) => (
                  <li key={item.service_id} className="text-sm text-slate-700">
                    {item.service_name_snapshot}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-end text-base font-medium text-slate-900">
                <PriceTag amountChf={Number(order.total_chf)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
