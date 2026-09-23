"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/Button";
import type {
  AdminSalesPackage,
  AdminSalesPackagePayload,
  SalesPackageTranslationInput,
} from "@/features/admin/types";

const EMPTY_TRANSLATIONS: Record<string, SalesPackageTranslationInput> = Object.fromEntries(
  routing.locales.map((locale) => [locale, { name: "", featuredLabel: null, includesLabel: null, features: [] }])
);

interface SalesPackageEditorProps {
  initial?: AdminSalesPackage;
  onSave: (payload: AdminSalesPackagePayload) => Promise<void>;
  onCancel: () => void;
}

export function SalesPackageEditor({ initial, onSave, onCancel }: SalesPackageEditorProps) {
  const t = useTranslations("AdminSalesPackages");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [monthlyPriceChf, setMonthlyPriceChf] = useState(initial?.monthly_price_chf ?? "0");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [installments, setInstallments] = useState(initial?.installments ?? 4);
  const [allowSinglePayment, setAllowSinglePayment] = useState(initial?.allow_single_payment ?? true);
  const [displayOrder] = useState(initial?.display_order ?? 0);
  const [translations, setTranslations] = useState<Record<string, SalesPackageTranslationInput>>({
    ...EMPTY_TRANSLATIONS,
    ...initial?.translations,
  });
  const [activeTab, setActiveTab] = useState<Locale>(routing.locales[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateTranslationField(field: "name" | "featuredLabel" | "includesLabel", value: string) {
    setTranslations((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value || null },
    }));
  }

  function updateFeature(index: number, value: string) {
    setTranslations((prev) => {
      const features = [...(prev[activeTab]?.features ?? [])];
      features[index] = value;
      return { ...prev, [activeTab]: { ...prev[activeTab], features } };
    });
  }

  function addFeature() {
    setTranslations((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], features: [...(prev[activeTab]?.features ?? []), ""] },
    }));
  }

  function removeFeature(index: number) {
    setTranslations((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        features: (prev[activeTab]?.features ?? []).filter((_, i) => i !== index),
      },
    }));
  }

  async function handleSubmit() {
    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        slug,
        monthly_price_chf: monthlyPriceChf,
        featured,
        active,
        installments,
        allow_single_payment: allowSinglePayment,
        display_order: displayOrder,
        translations,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  }

  const current = translations[activeTab] ?? EMPTY_TRANSLATIONS[activeTab];

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
          {t("monthlyPrice")}
          <input
            type="number"
            step="0.01"
            min="0"
            value={monthlyPriceChf}
            onChange={(e) => setMonthlyPriceChf(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="text-sm text-slate-700 dark:text-neutral-300">
          {t("installments")}
          <input
            type="number"
            step="1"
            min="1"
            value={installments}
            onChange={(e) => setInstallments(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <span className="mt-1 block text-xs text-slate-500 dark:text-neutral-400">{t("installmentsHint")}</span>
        </label>
        <div className="flex flex-col justify-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            {t("featured")}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            {t("active")}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={allowSinglePayment}
              onChange={(e) => setAllowSinglePayment(e.target.checked)}
            />
            {t("allowSinglePayment")}
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-b border-slate-200 dark:border-neutral-700">
        {routing.locales.map((locale) => (
          <button
            key={locale}
            onClick={() => setActiveTab(locale)}
            className={`px-3 py-2 text-sm font-medium uppercase ${
              activeTab === locale
                ? "border-b-2 border-brand-500 text-brand-600 dark:text-brand-200"
                : "text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
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
            value={current.name}
            onChange={(e) => updateTranslationField("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("featuredLabel")}
          <input
            value={current.featuredLabel ?? ""}
            onChange={(e) => updateTranslationField("featuredLabel", e.target.value)}
            placeholder={t("featuredLabelPlaceholder")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("includesLabel")}
          <input
            value={current.includesLabel ?? ""}
            onChange={(e) => updateTranslationField("includesLabel", e.target.value)}
            placeholder={t("includesLabelPlaceholder")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </label>

        <div>
          <p className="text-sm text-slate-700 dark:text-neutral-300">{t("features")}</p>
          <div className="mt-2 space-y-2">
            {current.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  aria-label={t("removeFeature")}
                  className="rounded-lg border border-slate-300 px-2.5 text-sm text-slate-500 hover:border-red-400 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-400"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="text-sm text-brand-600 hover:underline dark:text-brand-100"
            >
              + {t("addFeature")}
            </button>
          </div>
        </div>
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
