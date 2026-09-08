"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useServices } from "@/features/services/useServices";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const t = useTranslations("ServiceCard");
  const td = useTranslations("ServiceDetail");
  const { services, isLoading } = useServices();
  const service = services.find((s) => s.slug === params.slug);
  const isInCart = useCartStore((state) => (service ? state.isInCart(service.id) : false));
  const toggleService = useCartStore((state) => state.toggleService);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{td("loading")}</p>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-slate-600 dark:text-slate-300">{td("notFound")}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100"
        >
          {td("back")}
        </button>
      </div>
    );
  }

  const images = service.image_urls ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <button onClick={() => router.back()} className="text-sm text-brand-600 hover:underline dark:text-brand-100">
        ← {td("back")}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          {images.length > 0 ? (
            <div>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeImage]}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {images.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                        index === activeImage ? "border-brand-500" : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
          )}
        </div>

        <div>
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
            {service.category}
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50 sm:text-3xl">
            {service.name}
          </h1>
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {service.description}
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
            <PriceTag
              amountChf={Number(service.price_chf)}
              className="text-2xl font-semibold text-slate-900 dark:text-slate-50"
            />
            <AddToCartButton
              isInCart={isInCart}
              onClick={() => toggleService(service)}
              addLabel={t("add")}
              removeLabel={t("remove")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
