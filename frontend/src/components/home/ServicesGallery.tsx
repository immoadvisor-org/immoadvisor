"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useServices } from "@/features/services/useServices";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/features/services/types";

const TILTS = ["-rotate-2", "rotate-1", "-rotate-1"];

function GalleryCard({ service, tilt }: { service: Service; tilt: string }) {
  const t = useTranslations("ServiceCard");
  const isInCart = useCartStore((state) => state.isInCart(service.id));
  const toggleService = useCartStore((state) => state.toggleService);
  const image = service.image_urls[0];

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-md transition-all duration-300 hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-xl dark:bg-slate-900 ${tilt} ${
        isInCart ? "border-brand-500" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={service.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-brand-600 backdrop-blur dark:bg-slate-900/90 dark:text-brand-100">
          {service.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{service.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <PriceTag amountChf={Number(service.price_chf)} className="text-lg font-semibold text-slate-900 dark:text-slate-50" />
          <Button variant={isInCart ? "secondary" : "primary"} onClick={() => toggleService(service)}>
            {isInCart ? t("remove") : t("add")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ServicesGallery() {
  const t = useTranslations("Home");
  const { services, isLoading } = useServices();
  const topServices = services.slice(0, 3);

  if (!isLoading && topServices.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
          {t("servicesGalleryTitle")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {t("servicesGallerySubtitle")}
        </p>
      </div>

      {!isLoading && (
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {topServices.map((service, index) => (
            <GalleryCard key={service.id} service={service} tilt={TILTS[index % TILTS.length]} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/configuratore">
          <Button>{t("servicesGalleryCta")}</Button>
        </Link>
      </div>
    </section>
  );
}
