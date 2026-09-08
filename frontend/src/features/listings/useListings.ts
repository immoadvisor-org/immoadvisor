"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { apiFetch } from "@/lib/apiClient";
import type { Listing, ListingFilters } from "@/features/listings/types";

interface UseListingsResult {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
}

function buildQuery(locale: string, filters?: ListingFilters): string {
  const params = new URLSearchParams({ locale });
  if (filters?.city) params.set("city", filters.city);
  if (filters?.price_min) params.set("price_min", filters.price_min);
  if (filters?.price_max) params.set("price_max", filters.price_max);
  if (filters?.rooms_min) params.set("rooms_min", filters.rooms_min);
  if (filters?.rooms_max) params.set("rooms_max", filters.rooms_max);
  if (filters?.limit) params.set("limit", String(filters.limit));
  return params.toString();
}

export function useListings(filters?: ListingFilters): UseListingsResult {
  const locale = useLocale();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = buildQuery(locale, filters);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiFetch<Listing[]>(`/api/v1/listings?${query}`)
      .then((data) => {
        if (isMounted) setListings(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return { listings, isLoading, error };
}
