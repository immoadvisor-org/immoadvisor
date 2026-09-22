"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { useUser } from "@/features/auth/useUser";
import { useSalesPackages } from "@/features/salesPackages/useSalesPackages";
import { startPackageCheckout } from "@/features/checkout/checkoutApi";
import type { SalesPackage } from "@/features/salesPackages/salesPackagesApi";

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-brand-600 dark:text-brand-200"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

// La tabella di confronto (14 righe di funzionalità) è un contenuto fisso a
// 3 colonne Basic/Medium/All Inclusive, indipendente dal numero di
// pacchetti realmente in catalogo: se l'admin aggiunge o rimuove pacchetti,
// le card sopra si aggiornano subito, la tabella resta un confronto
// descrittivo dei 3 livelli storici (aggiornabile a parte in futuro se
// serve renderla anch'essa dinamica).
const COMPARISON_COLUMNS: { key: "basic" | "medium" | "allInclusive"; slug: string; fallback: string }[] = [
  { key: "basic", slug: "basic", fallback: "Basic" },
  { key: "medium", slug: "medium", fallback: "Medium" },
  { key: "allInclusive", slug: "all-inclusive", fallback: "All Inclusive" },
];

function ComparisonCell({ value }: { value: string }) {
  if (value === "check") {
    return <Check />;
  }
  if (!value) {
    return <span className="text-slate-300 dark:text-neutral-700">–</span>;
  }
  return <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{value}</span>;
}

function PackageCard({ pkg, buyLabel }: { pkg: SalesPackage; buyLabel: string }) {
  const t = useTranslations("SalesPackages");
  const locale = useLocale();
  const { user, session, isLoading: isLoadingUser } = useUser();
  // Il PDF descrive i pacchetti come una quota mensile: il pagamento a rate
  // è quindi proposto per primo (selezionato di default), con il pagamento
  // in un'unica soluzione come alternativa.
  const [paymentMode, setPaymentMode] = useState<"installments" | "single">("installments");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const monthlyPrice = Number(pkg.monthly_price_chf);
  const totalPrice = monthlyPrice * pkg.installments;

  async function handleBuy() {
    if (!session) return;
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const { checkout_url } = await startPackageCheckout(pkg.id, paymentMode, locale, session.access_token);
      window.location.href = checkout_url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t("checkoutError"));
      setIsCheckingOut(false);
    }
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-6 dark:bg-neutral-900 ${
        pkg.featured
          ? "border-brand-500 shadow-lg shadow-brand-100 dark:shadow-none"
          : "border-slate-200 shadow-sm dark:border-neutral-800"
      }`}
    >
      {pkg.featured && pkg.featured_label && (
        <span className="mb-3 inline-block w-fit rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          {pkg.featured_label}
        </span>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-50">{pkg.name}</h3>

      {pkg.installments > 1 && (
        <div className="mt-3 flex rounded-lg border border-slate-200 p-0.5 text-xs font-medium dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setPaymentMode("installments")}
            className={`flex-1 rounded-md px-2 py-1.5 transition-colors ${
              paymentMode === "installments"
                ? "bg-brand-500 text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {t("paymentModeInstallments", { count: pkg.installments })}
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode("single")}
            className={`flex-1 rounded-md px-2 py-1.5 transition-colors ${
              paymentMode === "single"
                ? "bg-brand-500 text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {t("paymentModeSingle")}
          </button>
        </div>
      )}

      <div className="mt-3 flex items-baseline gap-1">
        <PriceTag
          amountChf={paymentMode === "installments" ? monthlyPrice : totalPrice}
          className="text-2xl font-bold text-slate-900 dark:text-neutral-50"
        />
        <span className="text-sm text-slate-500 dark:text-neutral-400">
          {paymentMode === "installments" ? t("perMonth") : t("oneTime")}
        </span>
      </div>
      {paymentMode === "installments" && pkg.installments > 1 && (
        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
          {t("installmentsBreakdown", { count: pkg.installments, total: totalPrice.toLocaleString("de-CH") })}
        </p>
      )}

      {pkg.includes_label && (
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
          {pkg.includes_label}
        </p>
      )}

      <ul className="mt-3 flex-1 space-y-2">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
            <span className="mt-0.5 flex-shrink-0 text-brand-600 dark:text-brand-200">
              <Check />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {checkoutError && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{checkoutError}</p>}

      {!isLoadingUser && !user && (
        <p className="mt-4 text-xs text-slate-500 dark:text-neutral-400">
          {t("loginRequiredPrefix")}{" "}
          <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-100">
            {t("loginRequiredLink")}
          </Link>{" "}
          {t("loginRequiredSuffix")}
        </p>
      )}

      <Button
        variant={pkg.featured ? "primary" : "secondary"}
        className="mt-4 w-full"
        onClick={handleBuy}
        disabled={!user || isCheckingOut}
      >
        {isCheckingOut ? t("buying") : buyLabel}
      </Button>
    </div>
  );
}

export function SalesPackages() {
  const t = useTranslations("SalesPackages");
  const { packages, content, isLoading, error } = useSalesPackages();

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>;
  }

  if (error || !content || packages.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {content.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">{content.subtitle}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} buyLabel={content.buyLabel} />
        ))}
      </div>

      <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-200 dark:border-neutral-800">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900">
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-neutral-200">{t("featureColumn")}</th>
              <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-neutral-200">
                {t("individualPriceColumn")}
              </th>
              {COMPARISON_COLUMNS.map((col) => (
                <th key={col.key} className="px-4 py-3 text-center font-medium text-slate-700 dark:text-neutral-200">
                  {packages.find((pkg) => pkg.slug === col.slug)?.name ?? col.fallback}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.comparisonRows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 last:border-0 dark:border-neutral-800/60"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-neutral-50">{row.name}</p>
                  {row.description && (
                    <p className="text-xs text-slate-500 dark:text-neutral-400">{row.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-slate-600 dark:text-neutral-300">{row.individualPrice}</td>
                {COMPARISON_COLUMNS.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-center">
                    <ComparisonCell value={row[col.key]} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-slate-50 dark:bg-neutral-900">
              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-neutral-50">
                {content.monthlyFeeLabel}
              </td>
              <td className="px-4 py-3" />
              {COMPARISON_COLUMNS.map((col) => {
                const matched = packages.find((pkg) => pkg.slug === col.slug);
                return (
                  <td key={col.key} className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-neutral-50">
                    {matched ? <PriceTag amountChf={Number(matched.monthly_price_chf)} /> : "–"}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {content.notes.length > 0 && (
        <ul className="mt-6 space-y-1.5">
          {content.notes.map((note, index) => (
            <li key={index} className="text-xs leading-relaxed text-slate-500 dark:text-neutral-500">
              {note}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
