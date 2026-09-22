"use client";

import { useTranslations } from "next-intl";

import { PriceTag } from "@/components/ui/PriceTag";
import { DeleteIcon, EditIcon, ICON_BUTTON_CLASS, ICON_BUTTON_DANGER_CLASS } from "@/components/admin/icons";
import type { AdminSalesPackage } from "@/features/admin/types";

interface SalesPackageRowProps {
  salesPackage: AdminSalesPackage;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  onMove: (direction: "up" | "down") => void;
}

export function SalesPackageRow({
  salesPackage,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: SalesPackageRowProps) {
  const t = useTranslations("AdminSalesPackages");
  const label = salesPackage.translations.it?.name || salesPackage.translations.en?.name || salesPackage.slug;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 dark:border-neutral-800">
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onMove("up")}
          disabled={isFirst}
          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-neutral-500 dark:hover:text-neutral-200"
          aria-label={t("moveUp")}
        >
          ▲
        </button>
        <button
          onClick={() => onMove("down")}
          disabled={isLast}
          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-neutral-500 dark:hover:text-neutral-200"
          aria-label={t("moveDown")}
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-neutral-50">
          {label}
          {salesPackage.featured && (
            <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-500/20 dark:text-brand-100">
              {t("featured")}
            </span>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{salesPackage.slug}</p>
      </div>

      <PriceTag amountChf={Number(salesPackage.monthly_price_chf)} className="text-sm text-slate-700 dark:text-neutral-300" />

      <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-neutral-300">
        <input
          type="checkbox"
          checked={salesPackage.active}
          onChange={(e) => onToggleActive(e.target.checked)}
        />
        {salesPackage.active ? t("active") : t("inactive")}
      </label>

      <div className="flex gap-1">
        <button type="button" onClick={onEdit} aria-label={t("edit")} title={t("edit")} className={ICON_BUTTON_CLASS}>
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t("deleteConfirm"))) onDelete();
          }}
          aria-label={t("delete")}
          title={t("delete")}
          className={ICON_BUTTON_DANGER_CLASS}
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}
