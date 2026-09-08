"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import {
  deleteAdminServiceImage,
  uploadAdminServiceImage,
} from "@/features/admin/adminApi";
import type { AdminService, AdminServicePayload, TranslationInput } from "@/features/admin/types";

const EMPTY_TRANSLATIONS: Record<string, TranslationInput> = Object.fromEntries(
  routing.locales.map((locale) => [locale, { name: "", description: "" }])
);

interface ServiceEditorProps {
  initial?: AdminService;
  accessToken?: string;
  onSave: (payload: AdminServicePayload) => Promise<void>;
  onCancel: () => void;
}

export function ServiceEditor({ initial, accessToken, onSave, onCancel }: ServiceEditorProps) {
  const t = useTranslations("Admin");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "generico");
  const [priceChf, setPriceChf] = useState(initial?.price_chf ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order ?? 0);
  const [translations, setTranslations] = useState<Record<string, TranslationInput>>({
    ...EMPTY_TRANSLATIONS,
    ...initial?.translations,
  });
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.image_urls ?? []);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Locale>(routing.locales[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTranslation(locale: string, field: keyof TranslationInput, value: string) {
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }));
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !initial || !accessToken) return;

    setIsUploadingImage(true);
    setImageError(null);
    try {
      const updated = await uploadAdminServiceImage(initial.id, file, accessToken);
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
      const updated = await deleteAdminServiceImage(initial.id, url, accessToken);
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
        category,
        price_chf: priceChf,
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

  return (
    <div className="rounded-xl border border-brand-500 bg-white p-5 dark:bg-neutral-900">
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("slug")}
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("category")}
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("price")}
          <input
            type="number"
            step="0.01"
            min="0"
            value={priceChf}
            onChange={(e) => setPriceChf(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm text-slate-700 dark:text-neutral-300">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          {t("active")}
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
          {t("name")}
          <input
            value={translations[activeTab]?.name ?? ""}
            onChange={(e) => updateTranslation(activeTab, "name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("description")}
          <textarea
            value={translations[activeTab]?.description ?? ""}
            onChange={(e) => updateTranslation(activeTab, "description", e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-700 dark:text-neutral-300">{t("images")}</p>
        {!initial ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{t("saveBeforePhotos")}</p>
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
                  aria-label={t("removePhoto")}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-600 dark:border-neutral-600 dark:text-neutral-400">
              {isUploadingImage ? t("uploading") : `+ ${t("addPhoto")}`}
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
          {t("cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
