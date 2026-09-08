"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { getListingBySlug } from "@/features/listings/listingsApi";
import type { Listing } from "@/features/listings/types";
import { PriceTag } from "@/components/ui/PriceTag";

export default function ListingDetailPage() {
  const params = useParams<{ slug: string }>();
  const locale = useLocale();
  const t = useTranslations("ListingDetail");
  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setListing(undefined);
    getListingBySlug(params.slug, locale)
      .then((data) => {
        if (isMounted) setListing(data);
      })
      .catch(() => {
        if (isMounted) setListing(null);
      });
    return () => {
      isMounted = false;
    };
  }, [params.slug, locale]);

  if (listing === undefined) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>
    );
  }

  if (listing === null) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-slate-600 dark:text-slate-300">{t("notFound")}</p>
        <Link href="/annunci" className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100">
          {t("back")}
        </Link>
      </div>
    );
  }

  const images = listing.image_urls;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/annunci" className="text-sm text-brand-600 hover:underline dark:text-brand-100">
        ← {t("back")}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          {images.length > 0 ? (
            <div>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[activeImage]} alt={listing.title} className="h-full w-full object-cover" />
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

          {listing.video_url && (
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
              <video src={listing.video_url} controls className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
            {listing.city}
            {listing.canton ? ` — ${listing.canton}` : ""}
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50 sm:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("roomsValue", { rooms: listing.rooms })}
          </p>
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {listing.full_description}
          </p>

          <div className="mt-8 rounded-2xl border-t border-slate-200 pt-6 text-center dark:border-slate-800">
            <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("priceLabel")}</p>
            <PriceTag
              amountChf={Number(listing.price_chf)}
              className="mt-1 block text-4xl font-bold text-brand-600 dark:text-brand-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
