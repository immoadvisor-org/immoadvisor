"use client";

import { useLocale, useTranslations } from "next-intl";

import type { Service } from "@/features/services/types";
import { ServiceCard } from "@/components/configurator/ServiceCard";
import { ServiceRow } from "@/components/configurator/ServiceRow";
import { ViewModeToggle, useViewMode, type ViewMode } from "@/components/ui/ViewModeToggle";
import {
  SERVICE_CATEGORIES_CONFIG,
  groupServicesByCategory,
  serviceCategoryLabel,
  type ServiceGroup,
} from "@/config/serviceCategories";

function ServicesView({ services, viewMode }: { services: Service[]; viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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

// Tutti i gruppi in un'unica tabella: la categoria è una riga di intestazione.
function GroupedServicesTable({ groups, locale }: { groups: ServiceGroup[]; locale: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {groups.map((group, index) => (
        <section key={group.category} className={index > 0 ? "border-t border-slate-200 dark:border-neutral-800" : ""}>
          <h3 className="flex items-baseline gap-2 bg-brand-50 px-4 py-3 text-sm font-bold uppercase tracking-wide text-brand-700 dark:bg-neutral-700 dark:text-neutral-50 sm:px-5 sm:text-base">
            {serviceCategoryLabel(group.category, locale)}
          </h3>
          <div className="divide-y divide-slate-200 border-t border-slate-200 dark:divide-neutral-800 dark:border-neutral-800">
            {group.services.map((service) => (
              <ServiceRow key={service.id} service={service} showCategory={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface ServiceListProps {
  services: Service[];
  error: string | null;
}

export function ServiceList({ services, error }: ServiceListProps) {
  const t = useTranslations("ServiceList");
  const locale = useLocale();
  // Chiave "-v2": la vista predefinita è passata da griglia a lista, così
  // riparte dalla lista anche chi aveva già scelto con la versione precedente.
  const [viewMode, setViewMode] = useViewMode("services-view-mode-v2", "list");

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{t("error", { error })}</p>;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Il raggruppamento per categoria vale solo per la vista a lista: la
          griglia mostra i servizi in un unico blocco, nell'ordine dell'admin. */}
      {!SERVICE_CATEGORIES_CONFIG.groupByCategory || viewMode === "grid" ? (
        <ServicesView services={services} viewMode={viewMode} />
      ) : SERVICE_CATEGORIES_CONFIG.listGroupLayout === "single" ? (
        <GroupedServicesTable groups={groupServicesByCategory(services)} locale={locale} />
      ) : (
        <div className="flex flex-col gap-10">
          {groupServicesByCategory(services).map((group) => (
            <section key={group.category}>
              <h3 className="mb-3 flex items-baseline gap-2 text-lg font-semibold text-slate-900 dark:text-neutral-50">
                {serviceCategoryLabel(group.category, locale)}
              </h3>
              <ServicesView services={group.services} viewMode={viewMode} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
