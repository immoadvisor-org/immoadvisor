import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { TermsClient } from "./TermsClient";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale,
    pathWithoutLocale: "/terms",
    title: t("terms.title"),
    description: t("terms.description"),
  });
}

export default function TermsPage() {
  return <TermsClient />;
}
