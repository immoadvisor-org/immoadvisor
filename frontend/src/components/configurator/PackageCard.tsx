"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import type { SalesPackage } from "@/features/salesPackages/salesPackagesApi";

export function Check() {
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

export function PackageCard({ pkg, buyLabel }: { pkg: SalesPackage; buyLabel: string }) {
  const t = useTranslations("SalesPackages");
  // Il PDF descrive i pacchetti come una quota mensile: il pagamento a rate
  // è quindi proposto per primo (selezionato di default), con il pagamento
  // in un'unica soluzione come alternativa. La scelta fatta qui è solo
  // un'anteprima: il riepilogo prima del pagamento permette di cambiarla.
  const [paymentMode, setPaymentMode] = useState<"installments" | "single">("installments");
  const showPaymentModeToggle = pkg.installments > 1 && pkg.allow_single_payment;
  // Se il pagamento in un'unica soluzione è disattivato per questo
  // pacchetto, non esiste modo di impostare "single" (nessun pulsante lo
  // fa): questo garantisce comunque che il resto del componente non lo usi
  // mai per errore.
  const effectiveMode = showPaymentModeToggle ? paymentMode : "installments";

  const monthlyPrice = Number(pkg.monthly_price_chf);
  const totalPrice = monthlyPrice * pkg.installments;

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-6 transition-all duration-200 hover:-translate-y-1 dark:bg-neutral-900 ${
        pkg.featured
          ? "border-brand-500 shadow-lg shadow-brand-100 hover:shadow-xl dark:shadow-none"
          : "border-slate-200 shadow-sm hover:border-brand-300 hover:shadow-lg dark:border-neutral-800 dark:hover:border-brand-500/50"
      }`}
    >
      {pkg.featured && pkg.featured_label && (
        <span className="mb-3 inline-block w-fit rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          {pkg.featured_label}
        </span>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-50">{pkg.name}</h3>

      {showPaymentModeToggle && (
        <div className="mt-3 flex rounded-lg border border-slate-200 p-0.5 text-xs font-medium dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setPaymentMode("installments")}
            className={`flex-1 rounded-md px-2 py-1.5 transition-colors ${
              effectiveMode === "installments"
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
              effectiveMode === "single"
                ? "bg-brand-500 text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            {t("paymentModeSingle")}
          </button>
        </div>
      )}

      <div className={`flex items-baseline gap-1 ${showPaymentModeToggle ? "mt-3" : "mt-4"}`}>
        <PriceTag
          amountChf={effectiveMode === "installments" ? monthlyPrice : totalPrice}
          className="text-2xl font-bold text-slate-900 dark:text-neutral-50"
        />
        <span className="text-sm text-slate-500 dark:text-neutral-400">
          {effectiveMode === "installments" ? t("perMonth") : t("oneTime")}
        </span>
      </div>
      {effectiveMode === "installments" && pkg.installments > 1 && (
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

      <Link href={{ pathname: "/pacchetto", query: { packageId: pkg.id, mode: effectiveMode } }} className="mt-4 block">
        <Button variant={pkg.featured ? "primary" : "secondary"} className="w-full">
          {buyLabel}
        </Button>
      </Link>
    </div>
  );
}
