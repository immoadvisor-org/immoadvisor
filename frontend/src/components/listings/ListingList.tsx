"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useListings } from "@/features/listings/useListings";
import type { ListingFilters } from "@/features/listings/types";
import { ListingCard } from "@/components/listings/ListingCard";

const EMPTY_FILTERS: ListingFilters = {};

export function ListingList() {
  const t = useTranslations("Listings");
  const [formState, setFormState] = useState({
    city: "",
    price_min: "",
    price_max: "",
    rooms_min: "",
    rooms_max: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<ListingFilters>(EMPTY_FILTERS);
  const { listings, isLoading, error } = useListings(appliedFilters);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAppliedFilters({
      city: formState.city || undefined,
      price_min: formState.price_min || undefined,
      price_max: formState.price_max || undefined,
      rooms_min: formState.rooms_min || undefined,
      rooms_max: formState.rooms_max || undefined,
    });
  }

  function handleReset() {
    setFormState({ city: "", price_min: "", price_max: "", rooms_min: "", rooms_max: "" });
    setAppliedFilters(EMPTY_FILTERS);
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";
  const labelClass = "block text-sm text-slate-700 dark:text-neutral-300";

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-2 lg:grid-cols-5"
      >
        <label className={labelClass}>
          {t("filterCity")}
          <input
            value={formState.city}
            onChange={(e) => setFormState((prev) => ({ ...prev, city: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t("filterPriceMin")}
          <input
            type="number"
            min="0"
            value={formState.price_min}
            onChange={(e) => setFormState((prev) => ({ ...prev, price_min: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t("filterPriceMax")}
          <input
            type="number"
            min="0"
            value={formState.price_max}
            onChange={(e) => setFormState((prev) => ({ ...prev, price_max: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t("filterRoomsMin")}
          <input
            type="number"
            step="0.5"
            min="0"
            value={formState.rooms_min}
            onChange={(e) => setFormState((prev) => ({ ...prev, rooms_min: e.target.value }))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t("filterRoomsMax")}
          <input
            type="number"
            step="0.5"
            min="0"
            value={formState.rooms_max}
            onChange={(e) => setFormState((prev) => ({ ...prev, rooms_max: e.target.value }))}
            className={inputClass}
          />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {t("search")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-slate-800"
          >
            {t("resetFilters")}
          </button>
        </div>
      </form>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{t("error", { error })}</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-neutral-400">{t("noResults")}</p>
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
