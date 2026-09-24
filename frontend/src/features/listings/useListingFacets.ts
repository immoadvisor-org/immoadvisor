"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/apiClient";
import type { ListingFacets } from "@/features/listings/types";

const EMPTY_FACETS: ListingFacets = {
  cities: [],
  cantons: [],
  price_min: null,
  price_max: null,
  rooms_min: null,
  rooms_max: null,
};

/** Città, cantoni e intervalli presenti negli annunci attivi: la ricerca
 * propone solo valori che danno effettivamente risultati. */
export function useListingFacets(): ListingFacets {
  const [facets, setFacets] = useState<ListingFacets>(EMPTY_FACETS);

  useEffect(() => {
    let isMounted = true;
    apiFetch<ListingFacets>("/api/v1/listings/facets")
      .then((data) => {
        if (isMounted) setFacets(data);
      })
      .catch(() => {
        // Senza facets la ricerca funziona comunque con campi liberi.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return facets;
}
