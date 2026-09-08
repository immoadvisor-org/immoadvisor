import { useTranslations } from "next-intl";

import { PriceTag } from "@/components/ui/PriceTag";
import { DeleteIcon, ICON_BUTTON_DANGER_CLASS } from "@/components/admin/icons";
import type { Service } from "@/features/services/types";

interface CartItemRowProps {
  service: Service;
  onRemove: (serviceId: string) => void;
}

export function CartItemRow({ service, onRemove }: CartItemRowProps) {
  const t = useTranslations("CartItemRow");

  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-neutral-800">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-neutral-50">{service.name}</p>
        <PriceTag amountChf={Number(service.price_chf)} className="text-sm text-slate-500 dark:text-neutral-400" />
      </div>
      <button
        onClick={() => onRemove(service.id)}
        className={ICON_BUTTON_DANGER_CLASS}
        aria-label={t("removeAria", { name: service.name })}
        title={t("remove")}
      >
        <DeleteIcon />
      </button>
    </div>
  );
}
