import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { ConfiguratorContent } from "@/components/configurator/ConfiguratorContent";
import { getPageIntroSettings } from "@/features/pageIntro/pageIntroApi";

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

export default async function ConfiguratorPage() {
  const t = await getTranslations("Configurator");
  const introSettings = await getPageIntroSettings();

  return (
    <div>
      {introSettings.show_configurator_intro && <Hero title={t("title")} subtitle={t("subtitle")} />}
      <ConfiguratorContent
        servicesIntro={
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
              {t("buildOwnTitle")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">
              {t("buildOwnSubtitle")}
            </p>
          </div>
        }
      />
    </div>
  );
}
