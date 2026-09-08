"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useIsAdmin } from "@/features/profile/useIsAdmin";
import { listAllOrders, type AdminOrder } from "@/features/admin/ordersAdminApi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationEmailList } from "@/components/admin/NotificationEmailList";
import { EditIcon, ICON_BUTTON_CLASS } from "@/components/admin/icons";
import { PriceTag } from "@/components/ui/PriceTag";

type SortField = "date" | "email";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  cancelled: "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
  refund_pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  refunded: "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
};

const FULFILLMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
  processing: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  completed: "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-100",
};

export default function AdminOrdersPage() {
  const t = useTranslations("AdminOrders");
  const tOrders = useTranslations("Orders");
  const tAdmin = useTranslations("Admin");
  const { user, session, isLoading: isLoadingUser } = useUser();
  const isAdmin = useIsAdmin(user);
  const accessToken = session?.access_token;

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!isAdmin || !accessToken) return;
    setIsLoading(true);
    listAllOrders(accessToken)
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, [isAdmin, accessToken]);

  const filteredAndSorted = useMemo(() => {
    let result = orders;

    if (emailFilter.trim()) {
      const needle = emailFilter.trim().toLowerCase();
      result = result.filter((order) => (order.email ?? "").toLowerCase().includes(needle));
    }
    if (dateFrom) {
      result = result.filter((order) => order.created_at >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((order) => order.created_at.slice(0, 10) <= dateTo);
    }

    const sorted = [...result].sort((a, b) => {
      const cmp =
        sortField === "date"
          ? a.created_at.localeCompare(b.created_at)
          : (a.email ?? "").localeCompare(b.email ?? "");
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [orders, emailFilter, dateFrom, dateTo, sortField, sortDirection]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  if (isLoadingUser) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{tAdmin("loading")}</p>;
  }

  if (!user || !isAdmin || !accessToken) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 dark:text-neutral-300">{tAdmin("accessDenied")}</p>
    );
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-neutral-300">{t("subtitle")}</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-neutral-50">{t("notificationsTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{t("notificationsSubtitle")}</p>
        <div className="mt-3">
          <NotificationEmailList purpose="order" accessToken={accessToken} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("filterEmail")}
          <input
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="mt-1 block w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("filterDateFrom")}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("filterDateTo")}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
        ) : filteredAndSorted.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-neutral-400">{t("noOrders")}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="cursor-pointer select-none px-4 py-3" onClick={() => toggleSort("date")}>
                  {t("columnDate")}
                  {sortIndicator("date")}
                </th>
                <th className="cursor-pointer select-none px-4 py-3" onClick={() => toggleSort("email")}>
                  {t("columnEmail")}
                  {sortIndicator("email")}
                </th>
                <th className="px-4 py-3">{t("columnPaymentStatus")}</th>
                <th className="px-4 py-3">{t("columnFulfillmentStatus")}</th>
                <th className="px-4 py-3">{t("columnServices")}</th>
                <th className="px-4 py-3 text-right">{t("columnTotal")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {filteredAndSorted.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-neutral-300">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-neutral-50">{order.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        PAYMENT_STATUS_STYLES[order.payment_status] ?? PAYMENT_STATUS_STYLES.cancelled
                      }`}
                    >
                      {tOrders(`paymentStatus.${order.payment_status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        FULFILLMENT_STATUS_STYLES[order.fulfillment_status] ?? FULFILLMENT_STATUS_STYLES.pending
                      }`}
                    >
                      {tOrders(`fulfillmentStatus.${order.fulfillment_status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-neutral-300">
                    {order.items.map((item) => item.service_name_snapshot).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-neutral-50">
                    <PriceTag amountChf={Number(order.total_chf)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label={t("edit")}
                      title={t("edit")}
                      className={ICON_BUTTON_CLASS}
                    >
                      <EditIcon />
                    </Link>
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
