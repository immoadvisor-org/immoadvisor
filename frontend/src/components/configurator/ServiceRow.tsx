"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import type { Service } from "@/features/services/types";
import { serviceCategoryLabel } from "@/config/serviceCategories";

interface ServiceRowProps {
  service: Service;
  // "large": riga più alta, con immagine e testo più grandi (es. in home).
  size?: "default" | "large";
  // false quando la categoria è già indicata da un'intestazione sopra la riga.
  showCategory?: boolean;
}

// Variante "lista" di ServiceCard: una riga compatta, quasi da tabella, con
// il pulsante per aggiungere il servizio sempre sulla destra.
export function ServiceRow({ service, size = "default", showCategory = true }: ServiceRowProps) {
  const isLarge = size === "large";
  const t = useTranslations("ServiceCard");
  const locale = useLocale();
  const isInCart = useCartStore((state) => state.isInCart(service.id));
  const toggleService = useCartStore((state) => state.toggleService);
  const image = service.image_urls?.[0];
  const detailHref = `/services/${service.slug}`;

  return (
    <div
      className={`flex items-center gap-4 px-4 transition-colors sm:px-5 ${isLarge ? "py-5 sm:gap-6 sm:py-6" : "py-4"} ${
        isInCart ? "bg-brand-50/60 dark:bg-brand-500/10" : "hover:bg-slate-50 dark:hover:bg-neutral-800/50"
      }`}
    >
      <Link href={detailHref} className={`group flex min-w-0 flex-1 items-center gap-4 ${isLarge ? "sm:gap-6" : ""}`}>
        <div
          className={`flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-neutral-800 ${
            isLarge ? "h-24 w-24 sm:h-32 sm:w-44" : "h-16 w-16 sm:h-20 sm:w-20"
          }`}
        >
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={service.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {showCategory && (
            <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
              {serviceCategoryLabel(service.category, locale)}
            </span>
          )}
          <h3
            className={`${showCategory ? "mt-1" : ""} font-semibold text-slate-900 group-hover:text-brand-600 dark:text-neutral-50 dark:group-hover:text-brand-100 ${
              isLarge ? "text-base sm:text-lg" : "text-sm sm:text-base"
            }`}
          >
            {service.name}
          </h3>
          <p
            className={`hidden text-sm leading-relaxed text-slate-600 dark:text-neutral-300 ${
              isLarge ? "mt-1.5 sm:line-clamp-3" : "mt-0.5 sm:line-clamp-2"
            }`}
          >
            {service.description}
          </p>
        </div>
      </Link>

      <div className="flex flex-shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-5">
        <PriceTag
          amountChf={Number(service.price_chf)}
          className="text-base font-medium text-slate-900 dark:text-neutral-50 sm:text-lg"
        />
        <AddToCartButton
          isInCart={isInCart}
          onClick={() => toggleService(service)}
          addLabel={t("add")}
          removeLabel={t("remove")}
        />
      </div>
    </div>
  );
}
