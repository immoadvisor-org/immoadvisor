"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { apiFetch } from "@/lib/apiClient";
import type { Service } from "@/features/services/types";

interface UseServicesResult {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

export function useServices(): UseServicesResult {
  const locale = useLocale();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiFetch<Service[]>(`/api/v1/services?locale=${locale}`)
      .then((data) => {
        if (isMounted) setServices(data);
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
  }, [locale]);

  return { services, isLoading, error };
}
