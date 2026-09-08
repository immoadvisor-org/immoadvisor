"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { SWISS_CANTONS } from "@/lib/cantons";
import { Button } from "@/components/ui/Button";
import {
  deleteAdminListingImage,
  uploadAdminListingImage,
} from "@/features/admin/listingsAdminApi";
import type { AdminListing, AdminListingPayload, ListingTranslationInput } from "@/features/admin/listingTypes";

const EMPTY_TRANSLATIONS: Record<string, ListingTranslationInput> = Object.fromEntries(
  routing.locales.map((locale) => [locale, { title: "", short_description: "", full_description: "" }])
);

interface ListingEditorProps {
  initial?: AdminListing;
  accessToken?: string;
  onSave: (payload: AdminListingPayload) => Promise<void>;
  onCancel: () => void;
}

export function ListingEditor({ initial, accessToken, onSave, onCancel }: ListingEditorProps) {
  const t = useTranslations("AdminListings");
  const tAdmin = useTranslations("Admin");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [canton, setCanton] = useState(initial?.canton ?? "");
  const [priceChf, setPriceChf] = useState(initial?.price_chf ?? "0");
  const [rooms, setRooms] = useState(initial?.rooms ?? "3.5");
  const [videoUrl, setVideoUrl] = useState(initial?.video_url ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order ?? 0);
  const [translations, setTranslations] = useState<Record<string, ListingTranslationInput>>({
    ...EMPTY_TRANSLATIONS,
    ...initial?.translations,
  });
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Locale>(routing.locales[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTranslation(locale: string, field: keyof ListingTranslationInput, value: string) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !initial || !accessToken) return;

    setIsUploadingImage(true);
    setImageError(null);
    try {
      const updated = await uploadAdminListingImage(initial.id, file, accessToken);
      setImageUrls(updated.image_urls);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleRemoveImage(url: string) {
    if (!initial || !accessToken) return;
    setImageError(null);
    try {
      const updated = await deleteAdminListingImage(initial.id, url, accessToken);
      setImageUrls(updated.image_urls);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSubmit() {
    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        slug,
        city,
        canton: canton || null,
        price_chf: priceChf,
        rooms,
        video_url: videoUrl || null,
        active,
        display_order: displayOrder,
        translations,
        image_urls: imageUrls,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <div className="rounded-xl border border-brand-500 bg-white p-5 dark:bg-neutral-900">
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {tAdmin("slug")}
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("city")}
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("canton")}
          <select value={canton} onChange={(e) => setCanton(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {SWISS_CANTONS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {tAdmin("price")}
          <input
            type="number"
            step="0.01"
            min="0"
            value={priceChf}
            onChange={(e) => setPriceChf(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("rooms")}
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("videoUrl")}
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm text-slate-700 dark:text-neutral-300">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          {tAdmin("active")}
        </label>
      </div>

      <div className="mt-4 flex gap-2 border-b border-slate-200 dark:border-neutral-700">
        {routing.locales.map((locale) => (
          <button
            key={locale}
            onClick={() => setActiveTab(locale)}
            className={`px-3 py-2 text-sm font-medium uppercase ${
              activeTab === locale
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-200"
                : "text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-slate-200"
            }`}
          >
            {locale}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("titleLabel")}
          <input
            value={translations[activeTab]?.title ?? ""}
            onChange={(e) => updateTranslation(activeTab, "title", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("shortDescription")}
          <textarea
            value={translations[activeTab]?.short_description ?? ""}
            onChange={(e) => updateTranslation(activeTab, "short_description", e.target.value)}
            rows={2}
            className={inputClass}
          />
        </label>
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("fullDescription")}
          <textarea
            value={translations[activeTab]?.full_description ?? ""}
            onChange={(e) => updateTranslation(activeTab, "full_description", e.target.value)}
            rows={6}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-700 dark:text-neutral-300">{tAdmin("images")}</p>
        {!initial ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{tAdmin("saveBeforePhotos")}</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-3">
            {imageUrls.map((url) => (
              <div
                key={url}
                className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 dark:border-neutral-700"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  aria-label={tAdmin("removePhoto")}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-600 dark:border-neutral-600 dark:text-neutral-400">
              {isUploadingImage ? tAdmin("uploading") : `+ ${tAdmin("addPhoto")}`}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingImage}
                onChange={handleImageSelected}
              />
            </label>
          </div>
        )}
        {imageError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{imageError}</p>}
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          {tAdmin("cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {tAdmin("save")}
        </Button>
      </div>
    </div>
  );
}
