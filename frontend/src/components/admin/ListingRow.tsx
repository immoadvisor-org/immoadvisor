"use client";

import { useTranslations } from "next-intl";

import { PriceTag } from "@/components/ui/PriceTag";
import { Button } from "@/components/ui/Button";
import type { AdminListing } from "@/features/admin/listingTypes";

interface ListingRowProps {
  listing: AdminListing;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  onMove: (direction: "up" | "down") => void;
}

export function ListingRow({
  listing,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
}: ListingRowProps) {
  const t = useTranslations("Admin");
  const tListings = useTranslations("AdminListings");
  const label = listing.translations.it?.title || listing.translations.en?.title || listing.slug;

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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {listing.city} · {tListings("roomsValue", { rooms: listing.rooms })}
        </p>
      </div>

      <PriceTag amountChf={Number(listing.price_chf)} className="text-sm text-slate-700 dark:text-slate-300" />

      <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={listing.active} onChange={(e) => onToggleActive(e.target.checked)} />
        {listing.active ? t("active") : t("inactive")}
      </label>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onEdit}>
          {t("edit")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (window.confirm(t("deleteConfirm"))) onDelete();
          }}
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
