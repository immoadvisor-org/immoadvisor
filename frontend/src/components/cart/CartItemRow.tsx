import { useTranslations } from "next-intl";

import { PriceTag } from "@/components/ui/PriceTag";
import type { Service } from "@/features/services/types";

interface CartItemRowProps {
  service: Service;
  onRemove: (serviceId: string) => void;
}

export function CartItemRow({ service, onRemove }: CartItemRowProps) {
  const t = useTranslations("CartItemRow");

  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{service.name}</p>
        <PriceTag amountChf={Number(service.price_chf)} className="text-sm text-slate-500 dark:text-slate-400" />
      </div>
      <button
        onClick={() => onRemove(service.id)}
        className="text-sm text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
        aria-label={t("removeAria", { name: service.name })}
      >
        {t("remove")}
      </button>
    </div>
  );
}
