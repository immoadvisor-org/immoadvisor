"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { getAboutContent, type AboutContent } from "@/features/about/aboutApi";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  const t = useTranslations("ServiceDetail");
  const tAbout = useTranslations("About");
  const locale = useLocale();
  const [content, setContent] = useState<AboutContent | null>(null);
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
    return <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p>;
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
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
              {content.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {content.intro}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-illustration.svg"
            alt=""
            aria-hidden="true"
            className="w-full rounded-2xl"
          />
        </div>

        <h2 className="mt-16 text-xl font-semibold text-slate-900 dark:text-slate-50">
          {tAbout("valuesTitle")}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section className="relative mt-4 flex min-h-[280px] items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-illustration.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{content.cta_title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{content.cta_text}</p>
          <Link href="/contact" className="mt-6 inline-block">
            <Button>{content.cta_button}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
