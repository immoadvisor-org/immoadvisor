"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/features/services/types";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const t = useTranslations("ServiceCard");
  const isInCart = useCartStore((state) => state.isInCart(service.id));
  const toggleService = useCartStore((state) => state.toggleService);
  const [activeImage, setActiveImage] = useState(0);
  const images = service.image_urls ?? [];
  const detailHref = `/services/${service.slug}`;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all dark:bg-slate-900 ${
        isInCart
          ? "border-brand-500 shadow-md shadow-brand-100 dark:shadow-none"
          : "border-slate-200 shadow-sm hover:shadow-md dark:border-slate-800"
      }`}
    >
      {images.length > 0 && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Link href={detailHref}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage]}
              alt={service.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`${index + 1}`}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    index === activeImage ? "bg-white" : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <Link href={detailHref} className="flex flex-1 flex-col p-5">
        <span className="inline-block w-fit rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
          {service.category}
        </span>
        <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">{service.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {service.description}
        </p>
      </Link>
      <div className="flex items-center justify-between px-5 pb-5">
        <PriceTag amountChf={Number(service.price_chf)} className="text-lg font-medium text-slate-900 dark:text-slate-50" />
        <Button variant={isInCart ? "secondary" : "primary"} onClick={() => toggleService(service)}>
          {isInCart ? t("remove") : t("add")}
        </Button>
      </div>
    </div>
  );
}
