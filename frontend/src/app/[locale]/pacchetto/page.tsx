"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useUser } from "@/features/auth/useUser";
import { useSalesPackages } from "@/features/salesPackages/useSalesPackages";
import { startPackageCheckout } from "@/features/checkout/checkoutApi";
import { Check } from "@/components/configurator/PackageCard";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";

export default function PackageCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <PackageCheckoutContent />
    </Suspense>
  );
}

function PackageCheckoutContent() {
  const t = useTranslations("SalesPackages");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const requestedMode = searchParams.get("mode") === "single" ? "single" : "installments";

  const { user, session, isLoading: isLoadingUser } = useUser();
  const { packages, content, isLoading } = useSalesPackages();
  const [paymentMode, setPaymentMode] = useState<"installments" | "single">(requestedMode);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const pkg = packages.find((p) => p.id === packageId);

  async function handleConfirm() {
    if (!session || !pkg) return;
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

  if (isLoading) {
    return (
      <p className="mx-auto max-w-xl px-4 py-12 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
    );
  }

  if (!pkg || !content) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-slate-600 dark:text-neutral-300">{t("notFound")}</p>
        <Link href="/configuratore" className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100">
          {t("backToConfigurator")}
        </Link>
      </div>
    );
  }

  const monthlyPrice = Number(pkg.monthly_price_chf);
  const totalPrice = monthlyPrice * pkg.installments;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Link href="/configuratore" className="text-sm text-brand-600 hover:underline dark:text-brand-100">
        ← {t("backToConfigurator")}
      </Link>

      <h1 className="mt-4 text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("checkoutTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">{t("checkoutSubtitle")}</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-50">{pkg.name}</h2>
          {pkg.featured && pkg.featured_label && (
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              {pkg.featured_label}
            </span>
          )}
        </div>

        {pkg.installments > 1 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-neutral-300">{t("paymentModeLabel")}</p>
            <div className="mt-2 flex rounded-lg border border-slate-200 p-0.5 text-sm font-medium dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setPaymentMode("installments")}
                className={`flex-1 rounded-md px-3 py-2 transition-colors ${
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
                className={`flex-1 rounded-md px-3 py-2 transition-colors ${
                  paymentMode === "single"
                    ? "bg-brand-500 text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                }`}
              >
                {t("paymentModeSingle")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 dark:bg-neutral-800">
          {paymentMode === "installments" && (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-600 dark:text-neutral-300">{t("perInstallmentLabel")}</span>
                <PriceTag amountChf={monthlyPrice} className="text-lg font-semibold text-slate-900 dark:text-neutral-50" />
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                {t("installmentsCountLabel", { count: pkg.installments })}
              </p>
            </>
          )}
          <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 dark:border-neutral-700">
            <span className="text-sm font-medium text-slate-700 dark:text-neutral-300">{t("totalLabel")}</span>
            <PriceTag amountChf={totalPrice} className="text-lg font-semibold text-slate-900 dark:text-neutral-50" />
          </div>
        </div>

        {pkg.includes_label && (
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
            {pkg.includes_label}
          </p>
        )}
        <ul className="mt-2 space-y-2">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-neutral-300">
              <span className="mt-0.5 flex-shrink-0 text-brand-600 dark:text-brand-200">
                <Check />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {content.notes.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-neutral-800">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
              {t("notesTitle")}
            </p>
            <ul className="mt-2 space-y-1.5">
              {content.notes.map((note, index) => (
                <li key={index} className="text-xs leading-relaxed text-slate-500 dark:text-neutral-500">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {checkoutError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{checkoutError}</p>}

      {!isLoadingUser && !user && (
        <p className="mt-4 text-sm text-slate-600 dark:text-neutral-300">
          {t("loginRequiredPrefix")}{" "}
          <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-100">
            {t("loginRequiredLink")}
          </Link>{" "}
          {t("loginRequiredSuffix")}
        </p>
      )}

      <Button className="mt-6 w-full" onClick={handleConfirm} disabled={!user || isCheckingOut}>
        {isCheckingOut ? t("confirming") : t("confirmButton")}
      </Button>
    </div>
  );
}
