"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useOrders } from "@/features/orders/useOrders";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersPageContent />
    </Suspense>
  );
}

function OrdersPageContent() {
  const t = useTranslations("Orders");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, isLoading: isLoadingUser } = useUser();
  const { orders, isLoading: isLoadingOrders, error } = useOrders(session?.access_token);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.replace("/login");
    }
  }, [isLoadingUser, user, router]);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      clearCart();
      router.replace("/account/orders");
    }
  }, [searchParams, clearCart, router]);

  if (isLoadingUser || isLoadingOrders) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>;
  }

  if (error) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-red-600 dark:text-red-400">
        {t("error", { error })}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-slate-300">{t("empty")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {t(`paymentStatus.${order.payment_status}`)}
                  </span>
                  {order.payment_status === "paid" && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {t(`fulfillmentStatus.${order.fulfillment_status}`)}
                    </span>
                  )}
                </div>
              </div>

              <ul className="mt-3 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="text-sm text-slate-700 dark:text-slate-300">
                    {item.service_name_snapshot}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex justify-end text-base font-medium text-slate-900 dark:text-slate-50">
                <PriceTag amountChf={Number(order.total_chf)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
