"use client";

import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";

export function CartBar() {
  const t = useTranslations("CartBar");
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.items.length);
  const total = useCartStore((state) => state.total());
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);

  if (itemCount === 0 || pathname === "/cart") return null;

  return (
    <button
      onClick={toggleDrawer}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] dark:border-neutral-800 dark:bg-neutral-900"
      aria-label="Cart"
    >
      <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-neutral-50">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
          {itemCount}
        </span>
        {itemCount === 1 ? t("itemSingular") : t("itemPlural")}
      </span>
      <PriceTag amountChf={total} className="text-base font-medium text-slate-900 dark:text-neutral-50" />
    </button>
  );
}
