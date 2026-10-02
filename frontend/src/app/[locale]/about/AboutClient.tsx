"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  DEFAULT_ABOUT_CTA_IMAGE,
  DEFAULT_ABOUT_MAIN_IMAGE,
  getAboutContent,
  type AboutContentWithImages,
} from "@/features/about/aboutApi";
import { Button } from "@/components/ui/Button";

export function AboutClient() {
  const t = useTranslations("ServiceDetail");
  const tAbout = useTranslations("About");
  const locale = useLocale();
  const [content, setContent] = useState<AboutContentWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getAboutContent(locale)
      .then((data) => {
        if (isMounted) setContent(data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (isLoading) {
    return <p className="page-container py-12 text-sm text-slate-500 dark:text-neutral-400">{t("loading")}</p>;
  }

  if (!content) {
    return null;
  }

  const values = [
    { title: content.value1_title, text: content.value1_text },
    { title: content.value2_title, text: content.value2_text },
    { title: content.value3_title, text: content.value3_text },
  ];

  return (
    <div>
      <div className="page-container py-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 xl:gap-16">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-neutral-50 sm:text-4xl 2xl:text-6xl">
              {content.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-neutral-300 2xl:text-xl">
              {content.intro}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.main_image_url || DEFAULT_ABOUT_MAIN_IMAGE}
            alt=""
            aria-hidden="true"
            className="aspect-[3/2] w-full rounded-2xl object-cover"
          />
        </div>

        <h2 className="mt-16 text-xl font-semibold text-slate-900 dark:text-neutral-50 2xl:text-2xl">
          {tAbout("valuesTitle")}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 2xl:p-8"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-neutral-50 2xl:text-lg">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-neutral-300 2xl:text-base">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section className="relative mt-4 flex min-h-[280px] items-center overflow-hidden 2xl:min-h-[420px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.cta_image_url || DEFAULT_ABOUT_CTA_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
        <div className="relative page-container py-16 text-center 2xl:py-24">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl 2xl:text-5xl">{content.cta_title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85 2xl:max-w-2xl 2xl:text-xl">{content.cta_text}</p>
          <Link href="/contact" className="mt-6 inline-block">
            <Button variant="secondary">{content.cta_button}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
