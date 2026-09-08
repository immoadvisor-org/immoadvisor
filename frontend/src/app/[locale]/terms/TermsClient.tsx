"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getLegalContent } from "@/features/legal/legalApi";

export function TermsClient() {
  const t = useTranslations("Terms");
  const locale = useLocale();
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getLegalContent(locale)
      .then((data) => {
        if (isMounted) setContent(data.content);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-medium text-slate-900 dark:text-neutral-50">{t("title")}</h1>
      {isLoading ? (
        <p className="mt-6 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>
      ) : (
        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
          {content}
        </p>
      )}
    </div>
  );
}
