import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { ListingList } from "@/components/listings/ListingList";

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

export default function ListingsPage() {
  const t = useTranslations("Listings");

  return (
    <div>
      <Hero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ListingList />
      </div>
    </div>
  );
}
