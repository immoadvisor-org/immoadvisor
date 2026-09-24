"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useListings } from "@/features/listings/useListings";
import { useListingFacets } from "@/features/listings/useListingFacets";
import type { ListingSort } from "@/features/listings/types";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  EMPTY_SEARCH,
  ListingSearch,
  formatChf,
  toFilters,
  type ListingSearchValues,
} from "@/components/listings/ListingSearch";

const SORT_OPTIONS: ListingSort[] = ["default", "newest", "price_asc", "price_desc", "rooms_desc", "rooms_asc"];

export function ListingList() {
  const t = useTranslations("Listings");
  const facets = useListingFacets();
  // "draft" è ciò che si sta compilando, "applied" ciò che è stato cercato:
  // i risultati cambiano solo premendo Cerca, non a ogni tasto.
  const [draft, setDraft] = useState<ListingSearchValues>(EMPTY_SEARCH);
  const [applied, setApplied] = useState<ListingSearchValues>(EMPTY_SEARCH);
  const [sort, setSort] = useState<ListingSort>("default");
  const { listings, isLoading, error } = useListings({ ...toFilters(applied), sort });

  function handleReset() {
    setDraft(EMPTY_SEARCH);
    setApplied(EMPTY_SEARCH);
  }

  function removeFilter(keys: (keyof ListingSearchValues)[]) {
    const cleared = Object.fromEntries(keys.map((key) => [key, EMPTY_SEARCH[key]]));
    setDraft((prev) => ({ ...prev, ...cleared }));
    setApplied((prev) => ({ ...prev, ...cleared }));
  }

  const chips: { key: string; label: string; keys: (keyof ListingSearchValues)[] }[] = [];
  if (applied.q) chips.push({ key: "q", label: `“${applied.q}”`, keys: ["q"] });
  if (applied.canton) chips.push({ key: "canton", label: `${t("filterCanton")}: ${applied.canton}`, keys: ["canton"] });
  if (applied.city) chips.push({ key: "city", label: applied.city, keys: ["city"] });
  if (applied.price_min || applied.price_max) {
    const label =
      applied.price_min && applied.price_max
        ? `${formatChf(applied.price_min)} – ${formatChf(applied.price_max)}`
        : applied.price_min
          ? t("from", { value: formatChf(applied.price_min) })
          : t("upTo", { value: formatChf(applied.price_max) });
    chips.push({ key: "price", label, keys: ["price_min", "price_max"] });
  }
  if (applied.rooms_min || applied.rooms_max) {
    const label =
      applied.rooms_min && applied.rooms_max
        ? t("roomsRange", { min: applied.rooms_min, max: applied.rooms_max })
        : applied.rooms_min
          ? t("roomsAtLeast", { rooms: applied.rooms_min })
          : t("roomsAtMost", { rooms: applied.rooms_max });
    chips.push({ key: "rooms", label, keys: ["rooms_min", "rooms_max"] });
  }
  if (applied.has_images) chips.push({ key: "images", label: t("withPhotos"), keys: ["has_images"] });
  if (applied.has_video) chips.push({ key: "video", label: t("withVideo"), keys: ["has_video"] });

  return (
    <div>
      <ListingSearch
        values={draft}
        facets={facets}
        onChange={setDraft}
        onSubmit={() => setApplied(draft)}
        onReset={handleReset}
      />

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeFilter(chip.keys)}
              aria-label={t("removeFilter", { filter: chip.label })}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pl-3 pr-2 text-sm font-medium text-brand-600 hover:bg-brand-100 dark:bg-brand-500/20 dark:text-brand-100 dark:hover:bg-brand-500/30"
            >
              {chip.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-slate-500 underline-offset-2 hover:underline dark:text-neutral-400"
          >
            {t("clearAll")}
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-neutral-300" aria-live="polite">
          {isLoading ? t("loading") : error ? "" : t("resultsCount", { count: listings.length })}
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-300">
          {t("sortBy")}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ListingSort)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`sort.${option}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{t("error", { error })}</p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-neutral-700">
            <p className="font-medium text-slate-900 dark:text-neutral-50">{t("noResults")}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{t("noResultsHint")}</p>
            {chips.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                {t("clearAll")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
