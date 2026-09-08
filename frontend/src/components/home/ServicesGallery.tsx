"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useServices } from "@/features/services/useServices";
import { useCartStore } from "@/features/cart/cartStore";
import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import type { Service } from "@/features/services/types";

const TILTS = ["-rotate-2", "rotate-1", "-rotate-1"];

const CATEGORY_ART: Record<string, { icon: JSX.Element; accent: "amber" | "teal" }> = {
  legale: {
    accent: "amber",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="3" width="14" height="18" rx="1.5" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </svg>
    ),
  },
  consulenza: {
    accent: "teal",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="6" />
        <path d="M14.5 14.5L20 20" />
      </svg>
    ),
  },
  media: {
    accent: "amber",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <circle cx="12" cy="13.5" r="4" />
        <path d="M8 7l1.5-2.5h5L16 7" />
      </svg>
    ),
  },
  marketing: {
    accent: "teal",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 10v4h4l6 4V6l-6 4H4z" />
        <path d="M18 9a4 4 0 010 6" />
      </svg>
    ),
  },
};

const FALLBACK_ART: { icon: JSX.Element; accent: "amber" | "teal" } = {
  accent: "amber",
  icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l2.4 5.4L20 11l-5.6 2.6L12 19l-2.4-5.4L4 11l5.6-2.6L12 3z" />
    </svg>
  ),
};

const ACCENT_CLASSES: Record<"amber" | "teal", string> = {
  amber: "text-amber-400",
  teal: "text-teal-300",
};

function GalleryCard({ service, tilt }: { service: Service; tilt: string }) {
  const t = useTranslations("ServiceCard");
  const isInCart = useCartStore((state) => state.isInCart(service.id));
  const toggleService = useCartStore((state) => state.toggleService);
  const detailHref = `/services/${service.slug}`;
  const art = CATEGORY_ART[service.category.toLowerCase()] ?? FALLBACK_ART;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-md transition-all duration-300 hover:z-10 hover:-translate-y-2 hover:rotate-0 hover:shadow-xl dark:bg-slate-900 ${tilt} ${
        isInCart ? "border-brand-500" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <Link
        href={detailHref}
        className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,.18) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className={`relative transition-transform duration-500 group-hover:scale-110 ${ACCENT_CLASSES[art.accent]}`}>
          {art.icon}
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-amber-400 backdrop-blur">
          {service.category}
        </span>
      </Link>
      <Link href={detailHref} className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{service.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {service.description}
        </p>
      </Link>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 pb-5 pt-3 dark:border-slate-800">
        <PriceTag amountChf={Number(service.price_chf)} className="text-lg font-semibold text-slate-900 dark:text-slate-50" />
        <Button variant={isInCart ? "secondary" : "primary"} onClick={() => toggleService(service)}>
          {isInCart ? t("remove") : t("add")}
        </Button>
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
