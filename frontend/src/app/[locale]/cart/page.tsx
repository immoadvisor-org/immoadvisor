"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/cartStore";
import { useUser } from "@/features/auth/useUser";
import { startCheckout } from "@/features/checkout/checkoutApi";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const t = useTranslations("CartPage");
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const removeService = useCartStore((state) => state.removeService);
  const { user, session, isLoading: isLoadingUser } = useUser();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!session) return;

    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const { checkout_url } = await startCheckout(
        items.map((item) => item.id),
        locale,
        session.access_token
      );
      window.location.href = checkout_url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t("genericError"));
      setIsCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-slate-600 dark:text-slate-300">{t("empty")}</p>
        <Link href="/" className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100">
          {t("backToConfigurator")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-slate-50">{t("title")}</h1>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {items.map((service) => (
          <CartItemRow key={service.id} service={service} onRemove={removeService} />
        ))}

        <div className="mt-4 flex items-center justify-between text-lg font-medium text-slate-900 dark:text-slate-50">
          <span>{t("total")}</span>
          <PriceTag amountChf={total} />
        </div>
      </div>

      {checkoutError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{checkoutError}</p>}

      {!isLoadingUser && !user && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {t("loginRequiredPrefix")}{" "}
          <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-100">
            {t("loginRequiredLink")}
          </Link>{" "}
          {t("loginRequiredSuffix")}
        </p>
      )}

      <Button className="mt-6 w-full" onClick={handleCheckout} disabled={!user || isCheckingOut}>
        {isCheckingOut ? t("checkoutLoading") : t("checkout")}
      </Button>
    </div>
  );
}
