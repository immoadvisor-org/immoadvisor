"use client";

import { useEffect, useState } from "react";

import { getHomeLayout, type HomeSection } from "@/features/homeLayout/homeLayoutApi";

interface UseHomeLayoutResult {
  sections: HomeSection[];
  isLoading: boolean;
}

export function useHomeLayout(): UseHomeLayoutResult {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getHomeLayout()
      .then((data) => {
        if (isMounted) setSections(data.sections);
      })
      .catch(() => {
        // Se il layout non è ancora configurato (o la migration non è
        // stata eseguita), meglio nessuna sezione riordinabile che una
        // home rotta: Hero e Contatti restano comunque visibili.
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { sections, isLoading };
}
