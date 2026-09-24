"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { ListingFacets, ListingFilters } from "@/features/listings/types";

export interface ListingSearchValues {
  q: string;
  city: string;
  canton: string;
  price_min: string;
  price_max: string;
  rooms_min: string;
  rooms_max: string;
  has_images: boolean;
  has_video: boolean;
}

export const EMPTY_SEARCH: ListingSearchValues = {
  q: "",
  city: "",
  canton: "",
  price_min: "",
  price_max: "",
  rooms_min: "",
  rooms_max: "",
  has_images: false,
  has_video: false,
};

// Soglie tipiche dei portali svizzeri (Homegate, ImmoScout24): prezzo
// massimo a scaglioni e locali con la mezza stanza.
const PRICE_STEPS = [250000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000, 5000000];
const ROOM_STEPS = ["1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5", "6", "7", "8"];

const ADVANCED_KEYS: (keyof ListingSearchValues)[] = [
  "city",
  "canton",
  "price_min",
  "rooms_max",
  "has_images",
  "has_video",
];

export function formatChf(value: string | number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function toFilters(values: ListingSearchValues): ListingFilters {
  return {
    q: values.q.trim() || undefined,
    city: values.city || undefined,
    canton: values.canton || undefined,
    price_min: values.price_min || undefined,
    price_max: values.price_max || undefined,
    rooms_min: values.rooms_min || undefined,
    rooms_max: values.rooms_max || undefined,
    has_images: values.has_images || undefined,
    has_video: values.has_video || undefined,
  };
}

/** Aggiunge il valore corrente alle opzioni se non è uno degli scaglioni
 * (es. prezzo digitato a mano nella ricerca avanzata). */
function withCurrent(options: string[], current: string): string[] {
  if (!current || options.includes(current)) return options;
  return [...options, current].sort((a, b) => Number(a) - Number(b));
}

interface ListingSearchProps {
  values: ListingSearchValues;
  facets: ListingFacets;
  onChange: (values: ListingSearchValues) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function ListingSearch({ values, facets, onChange, onSubmit, onReset }: ListingSearchProps) {
  const t = useTranslations("Listings");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const advancedCount = ADVANCED_KEYS.filter((key) => Boolean(values[key])).length;

  function update<K extends keyof ListingSearchValues>(key: K, value: ListingSearchValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  const priceOptions = withCurrent(PRICE_STEPS.map(String), values.price_max);
  const roomMinOptions = withCurrent(ROOM_STEPS, values.rooms_min);
  const roomMaxOptions = withCurrent(ROOM_STEPS, values.rooms_max);

  const fieldClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";
  const smallFieldClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";
  const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none sm:p-4"
    >
      {/* Ricerca essenziale: dove / cosa, budget, locali */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={values.q}
            onChange={(e) => update("q", e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            list="listing-search-suggestions"
            className={`${fieldClass} pl-10`}
          />
          <datalist id="listing-search-suggestions">
            {[...facets.cities, ...facets.cantons].map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
        </div>

        <select
          value={values.price_max}
          onChange={(e) => update("price_max", e.target.value)}
          aria-label={t("priceMaxLabel")}
          className={fieldClass}
        >
          <option value="">{t("anyPrice")}</option>
          {priceOptions.map((price) => (
            <option key={price} value={price}>
              {t("upTo", { value: formatChf(price) })}
            </option>
          ))}
        </select>

        <select
          value={values.rooms_min}
          onChange={(e) => update("rooms_min", e.target.value)}
          aria-label={t("roomsMinLabel")}
          className={fieldClass}
        >
          <option value="">{t("anyRooms")}</option>
          {roomMinOptions.map((rooms) => (
            <option key={rooms} value={rooms}>
              {t("roomsAtLeast", { rooms })}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-12 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {t("search")}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen((open) => !open)}
          aria-expanded={isAdvancedOpen}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-600 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-brand-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
          {t("advancedSearch")}
          {advancedCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
              {advancedCount}
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          {t("resetFilters")}
        </button>
      </div>

      {/* Ricerca avanzata */}
      {isAdvancedOpen && (
        <div className="mt-3 grid grid-cols-1 gap-5 border-t border-slate-100 px-1 pb-1 pt-5 dark:border-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className={labelClass}>{t("filterCanton")}</span>
            <select
              value={values.canton}
              onChange={(e) => update("canton", e.target.value)}
              className={smallFieldClass}
            >
              <option value="">{t("allCantons")}</option>
              {facets.cantons.map((canton) => (
                <option key={canton} value={canton}>
                  {canton}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>{t("filterCity")}</span>
            <select
              value={values.city}
              onChange={(e) => update("city", e.target.value)}
              className={smallFieldClass}
            >
              <option value="">{t("allCities")}</option>
              {facets.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>{t("filterPrice")}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="10000"
                inputMode="numeric"
                value={values.price_min}
                onChange={(e) => update("price_min", e.target.value)}
                placeholder={t("min")}
                aria-label={t("filterPriceMin")}
                className={smallFieldClass}
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                min="0"
                step="10000"
                inputMode="numeric"
                value={values.price_max}
                onChange={(e) => update("price_max", e.target.value)}
                placeholder={t("max")}
                aria-label={t("filterPriceMax")}
                className={smallFieldClass}
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>{t("filterRooms")}</span>
            <div className="flex items-center gap-2">
              <select
                value={values.rooms_min}
                onChange={(e) => update("rooms_min", e.target.value)}
                aria-label={t("filterRoomsMin")}
                className={smallFieldClass}
              >
                <option value="">{t("min")}</option>
                {roomMinOptions.map((rooms) => (
                  <option key={rooms} value={rooms}>
                    {rooms}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">–</span>
              <select
                value={values.rooms_max}
                onChange={(e) => update("rooms_max", e.target.value)}
                aria-label={t("filterRoomsMax")}
                className={smallFieldClass}
              >
                <option value="">{t("max")}</option>
                {roomMaxOptions.map((rooms) => (
                  <option key={rooms} value={rooms}>
                    {rooms}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <span className={labelClass}>{t("filterFeatures")}</span>
            <div className="flex flex-wrap gap-2">
              <ToggleChip
                label={t("withPhotos")}
                checked={values.has_images}
                onChange={(checked) => update("has_images", checked)}
              />
              <ToggleChip
                label={t("withVideo")}
                checked={values.has_video}
                onChange={(checked) => update("has_video", checked)}
              />
            </div>
          </div>

          <div className="flex justify-end sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              {t("showResults")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

interface ToggleChipProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleChip({ label, checked, onChange }: ToggleChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        checked
          ? "border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-500 dark:bg-brand-500/20 dark:text-brand-100"
          : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
      }`}
    >
      {checked && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      {label}
    </button>
  );
}
