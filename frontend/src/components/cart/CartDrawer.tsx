"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/cartStore";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";

export function CartDrawer() {
  const t = useTranslations("CartDrawer");
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const removeService = useCartStore((state) => state.removeService);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">{t("title")}</h2>
          <button
            onClick={closeDrawer}
            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">{t("empty")}</p>
          ) : (
            items.map((service) => (
              <CartItemRow key={service.id} service={service} onRemove={removeService} />
            ))
          )}
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between text-base font-medium text-slate-900 dark:text-slate-50">
            <span>{t("total")}</span>
            <PriceTag amountChf={total} />
          </div>
          <Link href="/cart" onClick={closeDrawer}>
            <Button className="mt-4 w-full" disabled={items.length === 0}>
              {t("goToCart")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
