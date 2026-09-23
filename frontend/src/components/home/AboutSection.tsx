"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { getAboutContent, type AboutContent } from "@/features/about/aboutApi";

export function AboutSection() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [about, setAbout] = useState<AboutContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAboutContent(locale).then((data) => {
      if (isMounted) setAbout(data);
    });
    return () => {
      isMounted = false;
    };
  }, [locale]);

  if (!about) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/about-illustration.svg?v=2" alt="" aria-hidden="true" className="w-full rounded-2xl" />
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
            {about.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">{about.intro}</p>
          <Link href="/about" className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100">
            {t("discoverMore")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
