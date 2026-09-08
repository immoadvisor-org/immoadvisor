import type { Metadata } from "next";

import type { Locale } from "@/i18n/routing";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { apiFetch } from "@/lib/apiClient";
import type { Service } from "@/features/services/types";
import { ServiceDetailClient } from "./ServiceDetailClient";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

async function findService(locale: Locale, slug: string): Promise<Service | null> {
  try {
    const services = await apiFetch<Service[]>(`/api/v1/services?locale=${locale}`);
    return services.find((s) => s.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await findService(locale, slug);

  if (!service) {
    return buildMetadata({
      locale,
      pathWithoutLocale: `/services/${slug}`,
      title: slug,
      description: "",
      noIndex: true,
    });
  }

  return buildMetadata({
    locale,
    pathWithoutLocale: `/services/${slug}`,
    title: service.name,
    description: service.description,
    images: service.image_urls,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const service = await findService(locale, slug);

  const jsonLd = service
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.name,
        description: service.description,
        category: service.category,
        url: `${SITE_URL}/${locale}/services/${slug}`,
        offers: {
          "@type": "Offer",
          price: service.price_chf,
          priceCurrency: "CHF",
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ServiceDetailClient />
    </>
  );
}
