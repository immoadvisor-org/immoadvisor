"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useListings } from "@/features/listings/useListings";
import { useListingsEnabled } from "@/features/listings/useListingsEnabled";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/Button";

export function ListingsCarousel() {
  const t = useTranslations("Home");
  const listingsEnabled = useListingsEnabled();
  const { listings, isLoading } = useListings({ limit: 8 });
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listings.length < 2) return;

    const interval = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const firstCard = el.firstElementChild as HTMLElement | null;
      const cardWidth = firstCard ? firstCard.offsetWidth + 16 : 300;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + cardWidth, behavior: "smooth" });
    }, 4000);

    return () => clearInterval(interval);
  }, [listings]);

  if (!listingsEnabled || (!isLoading && listings.length === 0)) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {t("listingsTitle")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">{t("listingsSubtitle")}</p>
      </div>

      {!isLoading && (
        <div
          ref={scrollerRef}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {listings.map((listing) => (
            <div key={listing.id} className="w-72 flex-shrink-0 snap-start">
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/annunci">
          <Button variant="secondary">{t("listingsCta")}</Button>
        </Link>
      </div>
    </section>
  );
}
