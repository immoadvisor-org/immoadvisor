"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/home/Hero";
import { ListingsCarousel } from "@/components/home/ListingsCarousel";
import { ServicesGallery } from "@/components/home/ServicesGallery";
import { Button } from "@/components/ui/Button";
import { getAboutContent, type AboutContent } from "@/features/about/aboutApi";
import { getHowItWorksContent, type HowItWorksContent } from "@/features/howItWorks/howItWorksApi";

const STEP_ICONS = [
  <svg key="checklist" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>,
  <svg key="chart" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 19h16M7 19V9M12 19V5M17 19v7" />
  </svg>,
  <svg key="support" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="9" />
  </svg>,
];

export function HomeClient() {
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
        <section className="bg-slate-50 py-20 dark:bg-neutral-900">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
              {howItWorks.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">{howItWorks.text}</p>
          </div>

          {howItWorks.steps.length > 0 && (
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-10 px-4 sm:grid-cols-3">
              {howItWorks.steps.map((step, index) => (
                <div key={index} className="border-t border-slate-200 pt-5 dark:border-neutral-800">
                  <span className="font-mono text-sm text-amber-600 dark:text-amber-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-3 text-amber-600 dark:text-amber-400">{STEP_ICONS[index % STEP_ICONS.length]}</div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-neutral-50">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">{step.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <ServicesGallery />

      {about && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/about-illustration.svg" alt="" aria-hidden="true" className="w-full rounded-2xl" />
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
                {about.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">
                {about.intro}
              </p>
              <Link href="/about" className="mt-4 inline-block text-brand-600 hover:underline dark:text-brand-100">
                {t("discoverMore")} →
              </Link>
            </div>
          </div>
        </section>
      )}

      <ListingsCarousel />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {t("contactTitle")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">
          {t("contactText")}
        </p>
        <Link href="/contact" className="mt-6 inline-block">
          <Button variant="secondary">{t("contactCta")}</Button>
        </Link>
      </section>
    </div>
  );
}
