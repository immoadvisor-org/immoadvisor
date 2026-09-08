"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Listing } from "@/features/listings/types";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations("Listings");
  const image = listing.image_urls[0];
  const detailHref = `/annunci/${listing.slug}`;

  return (
    <Link
      href={detailHref}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">
          {listing.city}
        </span>
        <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-neutral-50">{listing.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
          {listing.short_description}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-neutral-800">
          <span className="text-sm text-slate-500 dark:text-neutral-400">
            {t("roomsValue", { rooms: listing.rooms })}
          </span>
          <PriceTag amountChf={Number(listing.price_chf)} className="text-lg font-semibold text-slate-900 dark:text-neutral-50" />
        </div>
      </div>
    </Link>
  );
}
