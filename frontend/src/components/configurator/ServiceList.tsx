"use client";

import { useTranslations } from "next-intl";

import { useServices } from "@/features/services/useServices";
import { ServiceCard } from "@/components/configurator/ServiceCard";

export function ServiceList() {
  const t = useTranslations("ServiceList");
  const { services, isLoading, error } = useServices();

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{t("error", { error })}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
