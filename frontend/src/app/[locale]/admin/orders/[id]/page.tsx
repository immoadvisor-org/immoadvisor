"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import {
  getAdminOrder,
  refundOrder,
  updateFulfillmentStatus,
  type AdminOrder,
} from "@/features/admin/ordersAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import type { OrderFulfillmentStatus } from "@/types/order";

const FULFILLMENT_OPTIONS: OrderFulfillmentStatus[] = ["processing", "completed"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("AdminOrderDetail");
  const tOrders = useTranslations("Orders");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isUpdatingFulfillment, setIsUpdatingFulfillment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(() => {
    if (!accessToken) return;
    setIsLoading(true);
    getAdminOrder(params.id, accessToken)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setIsLoading(false));
  }, [accessToken, params.id]);

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    loadOrder();
  }, [isAdmin, accessToken, loadOrder]);

  async function handleRefund() {
    if (!accessToken || !order) return;
    if (!window.confirm(t("refundConfirm"))) return;

    setIsRefunding(true);
    setError(null);
    try {
      const updated = await refundOrder(order.id, accessToken);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("refundError"));
    } finally {
      setIsRefunding(false);
    }
  }

  async function handleFulfillmentChange(newStatus: OrderFulfillmentStatus) {
    if (!accessToken || !order) return;
    setIsUpdatingFulfillment(true);
    setError(null);
    try {
      const updated = await updateFulfillmentStatus(order.id, newStatus, accessToken);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("fulfillmentUpdateError"));
    } finally {
      setIsUpdatingFulfillment(false);
    }
  }

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
      <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline dark:text-brand-100">
        ← {t("back")}
      </Link>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>
      ) : !order ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">{t("notFound")}</p>
      ) : (
        <div className="mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">{t("dateLabel")}</dt>
              <dd className="text-slate-900 dark:text-slate-50">{new Date(order.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">{t("customerLabel")}</dt>
              <dd className="text-slate-900 dark:text-slate-50">{order.email ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("itemsLabel")}</h2>
            <ul className="mt-3 space-y-1">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>{item.service_name_snapshot}</span>
                  <PriceTag amountChf={Number(item.price_chf_snapshot)} />
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-medium text-slate-900 dark:border-slate-800 dark:text-slate-50">
              <span>{t("totalLabel")}</span>
              <PriceTag amountChf={Number(order.total_chf)} />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("paymentStatusLabel")}</h2>
            <p className="mt-1 text-slate-700 dark:text-slate-300">
              {tOrders(`paymentStatus.${order.payment_status}`)}
            </p>
            {order.payment_status === "paid" && (
              <Button variant="secondary" className="mt-3" onClick={handleRefund} disabled={isRefunding}>
                {isRefunding ? t("refunding") : t("refundButton")}
              </Button>
            )}
            {order.payment_status === "refund_pending" && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{t("refundPendingNote")}</p>
            )}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("fulfillmentStatusLabel")}</h2>
            <select
              value={order.fulfillment_status}
              disabled={isUpdatingFulfillment}
              onChange={(e) => handleFulfillmentChange(e.target.value as OrderFulfillmentStatus)}
              className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {order.fulfillment_status === "pending" && (
                <option value="pending">{tOrders("fulfillmentStatus.pending")}</option>
              )}
              {FULFILLMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {tOrders(`fulfillmentStatus.${s}`)}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}
    </AdminLayout>
  );
}
