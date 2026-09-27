"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Listing } from "@/features/listings/types";

interface ListingRowProps {
  listing: Listing;
}

// Variante "lista" di ListingCard: miniatura a sinistra, informazioni
// principali a destra e pulsante per il dettaglio.
export function ListingRow({ listing }: ListingRowProps) {
  const t = useTranslations("Listings");
  const image = listing.image_urls[0];
  const location = [listing.city, listing.canton].filter(Boolean).join(", ");

  const facts = [
    t("roomsValue", { rooms: listing.rooms }),
    listing.image_urls.length > 0 ? t("photosCount", { count: listing.image_urls.length }) : null,
    listing.video_url ? t("withVideo") : null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <Link
      href={`/annunci/${listing.slug}`}
      className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative w-32 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-neutral-800 sm:w-64 lg:w-80">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={listing.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:flex-row sm:gap-6 sm:p-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-neutral-400">
            {location}
          </span>
          <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-neutral-50 sm:text-lg">{listing.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-neutral-300 sm:line-clamp-3">
            {listing.short_description}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <li
                key={fact}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-slate-100 pt-3 dark:border-neutral-800 sm:mt-0 sm:w-44 sm:flex-shrink-0 sm:flex-col sm:items-end sm:justify-between sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <PriceTag
            amountChf={Number(listing.price_chf)}
            hideCents
            className="text-lg font-semibold text-slate-900 dark:text-neutral-50"
            currencyClassName="mr-0.5 text-xs font-medium text-slate-500 dark:text-neutral-400"
          />
          {/* Tutta la riga è già un link: qui basta l'aspetto di un pulsante. */}
          <span className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-brand-600">
            {t("details")}
          </span>
        </div>
      </div>
    </Link>
  );
}
