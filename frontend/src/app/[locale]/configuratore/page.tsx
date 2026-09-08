import { useTranslations } from "next-intl";

import { Hero } from "@/components/home/Hero";
import { ServiceList } from "@/components/configurator/ServiceList";

export default function ConfiguratorPage() {
  const t = useTranslations("Configurator");

  return (
    <div>
      <Hero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ServiceList />
      </div>
    </div>
  );
}
