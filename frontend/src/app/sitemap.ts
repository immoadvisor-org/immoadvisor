import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { apiFetch } from "@/lib/apiClient";
import type { Service } from "@/features/services/types";
import type { Listing } from "@/features/listings/types";

const STATIC_PATHS = ["", "/about", "/contact", "/configuratore", "/annunci", "/terms"];

function localizedEntries(path: string, priority: number): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
    localizedEntries(path, path === "" ? 1 : 0.7)
  );

  try {
    const services = await apiFetch<Service[]>(`/api/v1/services?locale=${routing.defaultLocale}`);
    for (const service of services) {
      entries.push(...localizedEntries(`/services/${service.slug}`, 0.8));
    }
  } catch {
    // Il backend potrebbe non essere raggiungibile in fase di build: non blocchiamo la sitemap.
  }

  try {
    const listings = await apiFetch<Listing[]>(`/api/v1/listings?locale=${routing.defaultLocale}&limit=200`);
    for (const listing of listings) {
      entries.push(...localizedEntries(`/annunci/${listing.slug}`, 0.8));
    }
  } catch {
    // Idem per gli annunci.
  }

  return entries;
}
