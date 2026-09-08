"use client";

import { useEffect, useState } from "react";

import { getListingsSettings } from "@/features/listings/listingsApi";

export function useListingsEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getListingsSettings()
      .then((data) => {
        if (isMounted) setEnabled(data.enabled);
      })
      .catch(() => {
        // In caso di errore la sezione resta nascosta invece di rischiare di
        // mostrarla quando l'admin l'ha esplicitamente disattivata.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return enabled;
}
