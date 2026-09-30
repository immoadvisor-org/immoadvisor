"use client";

import { useTranslations } from "next-intl";

import { useServices } from "@/features/services/useServices";
import { ServiceCard } from "@/components/configurator/ServiceCard";
import { ServiceRow } from "@/components/configurator/ServiceRow";
import { ViewModeToggle, useViewMode } from "@/components/ui/ViewModeToggle";

export function ServiceList() {
  const t = useTranslations("ServiceList");
  const { services, isLoading, error } = useServices();
  const [viewMode, setViewMode] = useViewMode("services-view-mode");

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{t("error", { error })}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
