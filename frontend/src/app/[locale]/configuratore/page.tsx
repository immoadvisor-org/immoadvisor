import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { ServiceList } from "@/components/configurator/ServiceList";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale,
    pathWithoutLocale: "/configuratore",
    title: t("configurator.title"),
    description: t("configurator.description"),
  });
}

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
