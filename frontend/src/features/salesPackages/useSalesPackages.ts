"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import {
  getSalesPackages,
  getSalesPackagesContent,
  type SalesPackage,
  type SalesPackagesContent,
} from "@/features/salesPackages/salesPackagesApi";

interface UseSalesPackagesResult {
  packages: SalesPackage[];
  content: SalesPackagesContent | null;
  isLoading: boolean;
  error: string | null;
}

export function useSalesPackages(): UseSalesPackagesResult {
  const locale = useLocale();
  const [packages, setPackages] = useState<SalesPackage[]>([]);
  const [content, setContent] = useState<SalesPackagesContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([getSalesPackages(locale), getSalesPackagesContent(locale)])
      .then(([packagesData, contentData]) => {
        if (isMounted) {
          setPackages(packagesData);
          setContent(contentData);
        }
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

  return { packages, content, isLoading, error };
}
