"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/home/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ListingsCarousel } from "@/components/home/ListingsCarousel";
import { PackagesGallery } from "@/components/home/PackagesGallery";
import { ServicesGallery } from "@/components/home/ServicesGallery";
import { Button } from "@/components/ui/Button";
import { useHomeLayout } from "@/features/homeLayout/useHomeLayout";
import type { HomeSectionKey } from "@/features/homeLayout/homeLayoutApi";

// Hero e la sezione di contatto finale sono fisse (prima e ultima): solo
// queste cinque sono riordinabili e nascondibili dall'admin.
const SECTION_COMPONENTS: Record<HomeSectionKey, ComponentType> = {
  packages: PackagesGallery,
  services: ServicesGallery,
  about: AboutSection,
  listings: ListingsCarousel,
  how_it_works: HowItWorksSection,
};

export function HomeClient() {
  const t = useTranslations("Home");
  const { sections } = useHomeLayout();

  return (
    <div>
      <Hero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        cta={{ href: "/configuratore", label: t("heroCta") }}
      />

      {sections
        .filter((section) => section.visible)
        .map((section) => {
          const SectionComponent = SECTION_COMPONENTS[section.key];
          return SectionComponent ? <SectionComponent key={section.key} /> : null;
        })}

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
