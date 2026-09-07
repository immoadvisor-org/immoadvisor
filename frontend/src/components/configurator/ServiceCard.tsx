"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all ${
        isInCart ? "border-brand-500 shadow-md shadow-brand-100" : "border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      {images.length > 0 && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImage]}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
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
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-brand-600">
            {service.category}
          </span>
          <h3 className="mt-2 text-base font-semibold text-slate-900">{service.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <PriceTag amountChf={Number(service.price_chf)} className="text-lg font-medium text-slate-900" />
          <Button variant={isInCart ? "secondary" : "primary"} onClick={() => toggleService(service)}>
            {isInCart ? t("remove") : t("add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
