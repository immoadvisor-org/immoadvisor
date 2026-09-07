import { useTranslations } from "next-intl";

import { ServiceList } from "@/components/configurator/ServiceList";

export default function ConfiguratorPage() {
  const t = useTranslations("Configurator");

  return (
    <div>
      <h1 className="text-2xl font-medium text-slate-900">{t("title")}</h1>
      <p className="mt-2 text-slate-600">{t("subtitle")}</p>
      <div className="mt-8">
        <ServiceList />
      </div>
    </div>
  );
}
