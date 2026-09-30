"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import type { Service } from "@/features/services/types";

interface ServiceRowProps {
  service: Service;
}

// Variante "lista" di ServiceCard: una riga compatta, quasi da tabella, con
// il pulsante per aggiungere il servizio sempre sulla destra.
export function ServiceRow({ service }: ServiceRowProps) {
  const t = useTranslations("ServiceCard");
  const isInCart = useCartStore((state) => state.isInCart(service.id));
  const toggleService = useCartStore((state) => state.toggleService);
  const image = service.image_urls?.[0];
  const detailHref = `/services/${service.slug}`;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-4 transition-colors sm:px-5 ${
        isInCart ? "bg-brand-50/60 dark:bg-brand-500/10" : "hover:bg-slate-50 dark:hover:bg-neutral-800/50"
      }`}
    >
      <Link href={detailHref} className="group flex min-w-0 flex-1 items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-neutral-800 sm:h-20 sm:w-20">
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
          <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
            {service.category}
          </span>
          <h3 className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-brand-600 dark:text-neutral-50 dark:group-hover:text-brand-100 sm:text-base">
            {service.name}
          </h3>
          <p className="mt-0.5 hidden text-sm leading-relaxed text-slate-600 dark:text-neutral-300 sm:line-clamp-2">
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
