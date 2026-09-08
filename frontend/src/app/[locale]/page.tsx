"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/home/Hero";
import { ListingsCarousel } from "@/components/home/ListingsCarousel";
import { Button } from "@/components/ui/Button";
import { getAboutContent, type AboutContent } from "@/features/about/aboutApi";
import { getHowItWorksContent, type HowItWorksContent } from "@/features/howItWorks/howItWorksApi";

export default function HomePage() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [howItWorks, setHowItWorks] = useState<HowItWorksContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAboutContent(locale).then((data) => {
      if (isMounted) setAbout(data);
    });
    getHowItWorksContent(locale).then((data) => {
      if (isMounted) setHowItWorks(data);
    });
    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <div>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        cta={{ href: "/configuratore", label: t("heroCta") }}
      />

      {howItWorks && (
        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
              {howItWorks.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {howItWorks.text}
            </p>
            <Link href="/configuratore" className="mt-6 inline-block">
              <Button>{t("howItWorksCta")}</Button>
            </Link>
          </div>
        </section>
      )}

      <ListingsCarousel />

      {about && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about-illustration.svg" alt="" aria-hidden="true" className="w-full rounded-2xl" />
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
                {about.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {about.intro}
              </p>
              <Link href="/about" className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100">
                {t("discoverMore")} →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 sm:text-3xl">
          {t("contactTitle")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {t("contactText")}
        </p>
        <Link href="/contact" className="mt-6 inline-block">
          <Button variant="secondary">{t("contactCta")}</Button>
        </Link>
      </section>
    </div>
  );
}
