"use client";

import { useTranslations } from "next-intl";

import { PriceTag } from "@/components/ui/PriceTag";
import { DeleteIcon, EditIcon, ICON_BUTTON_CLASS, ICON_BUTTON_DANGER_CLASS } from "@/components/admin/icons";
import type { AdminService } from "@/features/admin/types";

interface ServiceRowProps {
  service: AdminService;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  onMove: (direction: "up" | "down") => void;
}

export function ServiceRow({
  service,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: ServiceRowProps) {
  const t = useTranslations("Admin");
  const label = service.translations.it?.name || service.translations.en?.name || service.slug;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 dark:border-slate-800">
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onMove("up")}
          disabled={isFirst}
          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-slate-500 dark:hover:text-slate-200"
          aria-label={t("moveUp")}
        >
          ▲
        </button>
        <button
          onClick={() => onMove("down")}
          disabled={isLast}
          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30 dark:text-slate-500 dark:hover:text-slate-200"
          aria-label={t("moveDown")}
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{service.slug}</p>
      </div>

      <PriceTag amountChf={Number(service.price_chf)} className="text-sm text-slate-700 dark:text-slate-300" />

      <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={service.active}
          onChange={(e) => onToggleActive(e.target.checked)}
        />
        {service.active ? t("active") : t("inactive")}
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
