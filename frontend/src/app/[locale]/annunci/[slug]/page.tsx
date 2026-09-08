import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { apiFetch } from "@/lib/apiClient";
import type { Listing } from "@/features/listings/types";
import { ListingDetailClient } from "./ListingDetailClient";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function findListing(locale: Locale, slug: string): Promise<Listing | null> {
  try {
    return await apiFetch<Listing>(`/api/v1/listings/${slug}?locale=${locale}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const listing = await findListing(locale, slug);

  if (!listing) {
    return buildMetadata({
      locale,
      pathWithoutLocale: `/annunci/${slug}`,
      title: slug,
      description: "",
      noIndex: true,
    });
  }

  return buildMetadata({
    locale,
    pathWithoutLocale: `/annunci/${slug}`,
    title: `${listing.title} — ${listing.city}`,
    description: listing.short_description,
    images: listing.image_urls,
  });
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const listing = await findListing(locale, slug);

  const jsonLd = listing
    ? {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: listing.title,
        description: listing.short_description,
        url: `${SITE_URL}/${locale}/annunci/${slug}`,
        image: listing.image_urls,
        address: {
          "@type": "PostalAddress",
          addressLocality: listing.city,
          addressRegion: listing.canton ?? undefined,
          addressCountry: "CH",
        },
        offers: {
          "@type": "Offer",
          price: listing.price_chf,
          priceCurrency: "CHF",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ListingDetailClient />
    </>
  );
}
