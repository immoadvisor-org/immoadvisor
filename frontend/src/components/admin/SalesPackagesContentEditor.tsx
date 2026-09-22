"use client";

import { useTranslations } from "next-intl";

import type { SalesPackageComparisonRowInput, SalesPackagesTranslationInput } from "@/features/admin/types";

const EMPTY_ROW: SalesPackageComparisonRowInput = {
  name: "",
  description: "",
  individualPrice: "",
  basic: "",
  medium: "",
  allInclusive: "",
};

interface SalesPackagesContentEditorProps {
  value: SalesPackagesTranslationInput;
  onChange: (value: SalesPackagesTranslationInput) => void;
}

export function SalesPackagesContentEditor({ value, onChange }: SalesPackagesContentEditorProps) {
  const t = useTranslations("AdminSalesPackages");

  function updateField(field: "title" | "subtitle" | "monthlyFeeLabel" | "buyLabel", text: string) {
    onChange({ ...value, [field]: text });
  }

  function updateRow(index: number, field: keyof SalesPackageComparisonRowInput, text: string) {
    const comparisonRows = value.comparisonRows.map((row, i) => (i === index ? { ...row, [field]: text } : row));
    onChange({ ...value, comparisonRows });
  }

  function addRow() {
    onChange({ ...value, comparisonRows: [...value.comparisonRows, { ...EMPTY_ROW }] });
  }

  function removeRow(index: number) {
    onChange({ ...value, comparisonRows: value.comparisonRows.filter((_, i) => i !== index) });
  }

  function updateNote(index: number, text: string) {
    const notes = value.notes.map((note, i) => (i === index ? text : note));
    onChange({ ...value, notes });
  }

  function addNote() {
    onChange({ ...value, notes: [...value.notes, ""] });
  }

  function removeNote(index: number) {
    onChange({ ...value, notes: value.notes.filter((_, i) => i !== index) });
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("pageTitle")}
          <input value={value.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm text-slate-700 dark:text-neutral-300">
          {t("buyLabel")}
          <input value={value.buyLabel} onChange={(e) => updateField("buyLabel", e.target.value)} className={inputClass} />
        </label>
      </div>
      <label className="block text-sm text-slate-700 dark:text-neutral-300">
        {t("pageSubtitle")}
        <textarea
          value={value.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
          rows={2}
          className={inputClass}
        />
      </label>
      <label className="block text-sm text-slate-700 dark:text-neutral-300">
        {t("monthlyFeeLabel")}
        <input
          value={value.monthlyFeeLabel}
          onChange={(e) => updateField("monthlyFeeLabel", e.target.value)}
          className={inputClass}
        />
      </label>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-neutral-300">{t("comparisonRows")}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{t("comparisonRowsHint")}</p>
        <div className="mt-3 space-y-4">
          {value.comparisonRows.map((row, index) => (
            <div key={index} className="rounded-lg border border-slate-200 p-4 dark:border-neutral-700">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-neutral-500">
                  {t("rowNumber", { number: index + 1 })}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  aria-label={t("removeRow")}
                  className="text-xs text-slate-500 hover:text-red-600 dark:text-neutral-400"
                >
                  × {t("removeRow")}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs text-slate-600 dark:text-neutral-400">
                  {t("rowName")}
                  <input value={row.name} onChange={(e) => updateRow(index, "name", e.target.value)} className={inputClass} />
                </label>
                <label className="block text-xs text-slate-600 dark:text-neutral-400">
                  {t("rowDescription")}
                  <input
                    value={row.description}
                    onChange={(e) => updateRow(index, "description", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block text-xs text-slate-600 dark:text-neutral-400">
                  {t("rowIndividualPrice")}
                  <input
                    value={row.individualPrice}
                    onChange={(e) => updateRow(index, "individualPrice", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block text-xs text-slate-600 dark:text-neutral-400">
                    Basic
                    <input value={row.basic} onChange={(e) => updateRow(index, "basic", e.target.value)} className={inputClass} />
                  </label>
                  <label className="block text-xs text-slate-600 dark:text-neutral-400">
                    Medium
                    <input value={row.medium} onChange={(e) => updateRow(index, "medium", e.target.value)} className={inputClass} />
                  </label>
                  <label className="block text-xs text-slate-600 dark:text-neutral-400">
                    All Inclusive
                    <input
                      value={row.allInclusive}
                      onChange={(e) => updateRow(index, "allInclusive", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="mt-3 text-sm text-brand-600 hover:underline dark:text-brand-100">
          + {t("addRow")}
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-neutral-300">{t("notes")}</p>
        <div className="mt-2 space-y-2">
          {value.notes.map((note, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={note}
                onChange={(e) => updateNote(index, e.target.value)}
                rows={2}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeNote(index)}
                aria-label={t("removeNote")}
                className="h-fit rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-500 hover:border-red-400 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addNote} className="mt-2 text-sm text-brand-600 hover:underline dark:text-brand-100">
          + {t("addNote")}
        </button>
      </div>
    </div>
  );
}
