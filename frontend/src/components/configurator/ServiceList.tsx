"use client";

import { useLocale, useTranslations } from "next-intl";

import { useServices } from "@/features/services/useServices";
import type { Service } from "@/features/services/types";
import { ServiceCard } from "@/components/configurator/ServiceCard";
import { ServiceRow } from "@/components/configurator/ServiceRow";
import { ViewModeToggle, useViewMode, type ViewMode } from "@/components/ui/ViewModeToggle";
import {
  SERVICE_CATEGORIES_CONFIG,
  groupServicesByCategory,
  serviceCategoryLabel,
} from "@/config/serviceCategories";

function ServicesView({ services, viewMode }: { services: Service[]; viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    );
  }
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {services.map((service) => (
        <ServiceRow key={service.id} service={service} />
      ))}
    </div>
  );
}

export function ServiceList() {
  const t = useTranslations("ServiceList");
  const locale = useLocale();
  const { services, isLoading, error } = useServices();
  // Chiave "-v2": la vista predefinita è passata da griglia a lista, così
  // riparte dalla lista anche chi aveva già scelto con la versione precedente.
  const [viewMode, setViewMode] = useViewMode("services-view-mode-v2", "list");

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

      {SERVICE_CATEGORIES_CONFIG.groupByCategory ? (
        <div className="flex flex-col gap-10">
          {groupServicesByCategory(services).map((group) => (
            <section key={group.category}>
              <h3 className="mb-3 flex items-baseline gap-2 text-lg font-semibold text-slate-900 dark:text-neutral-50">
                {serviceCategoryLabel(group.category, locale)}
                <span className="text-sm font-normal text-slate-400 dark:text-neutral-500">{group.services.length}</span>
              </h3>
              <ServicesView services={group.services} viewMode={viewMode} />
            </section>
          ))}
        </div>
      ) : (
        <ServicesView services={services} viewMode={viewMode} />
      )}
    </div>
  );
}
