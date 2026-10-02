import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { ListingList } from "@/components/listings/ListingList";
import { getPageIntroSettings } from "@/features/pageIntro/pageIntroApi";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale,
    pathWithoutLocale: "/annunci",
    title: t("listings.title"),
    description: t("listings.description"),
  });
}

export default async function ListingsPage() {
  const t = await getTranslations("Listings");
  const introSettings = await getPageIntroSettings();

  return (
    <div>
      {introSettings.show_listings_intro && <Hero title={t("title")} subtitle={t("subtitle")} />}
      <div className="page-container py-12">
        <ListingList />
      </div>
    </div>
  );
}
