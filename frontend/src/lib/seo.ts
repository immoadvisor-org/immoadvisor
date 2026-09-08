import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";
import { BRAND_NAME } from "@/lib/constants";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://immoadvisor.vercel.app").replace(/\/$/, "");

/**
 * Costruisce gli alternates (canonical + hreflang) per una pagina dato il suo
 * path senza prefisso di lingua, es. "/annunci" o "/services/foo".
 */
export function buildAlternates(locale: Locale, pathWithoutLocale: string) {
  const normalizedPath = pathWithoutLocale === "/" ? "" : pathWithoutLocale;
  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${SITE_URL}/${loc}${normalizedPath}`])
  );
  return {
    canonical: `${SITE_URL}/${locale}${normalizedPath}`,
    languages: { ...languages, "x-default": `${SITE_URL}/${routing.defaultLocale}${normalizedPath}` },
  };
}

interface BuildMetadataOptions {
  locale: Locale;
  pathWithoutLocale: string;
  title: string;
  description: string;
  images?: string[];
  noIndex?: boolean;
}

export function buildMetadata({
  locale,
  pathWithoutLocale,
  title,
  description,
  images,
  noIndex,
}: BuildMetadataOptions): Metadata {
  const alternates = buildAlternates(locale, pathWithoutLocale);
  return {
    title,
    description,
    alternates,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: BRAND_NAME,
      locale,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
