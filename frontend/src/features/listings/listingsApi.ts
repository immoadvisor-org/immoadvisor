import { apiFetch } from "@/lib/apiClient";
import type { Listing } from "@/features/listings/types";

export function getListingBySlug(slug: string, locale: string): Promise<Listing> {
  return apiFetch<Listing>(`/api/v1/listings/${slug}?locale=${locale}`);
}
