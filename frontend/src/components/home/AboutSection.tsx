"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  DEFAULT_ABOUT_MAIN_IMAGE,
  getAboutContent,
  type AboutContentWithImages,
} from "@/features/about/aboutApi";

export function AboutSection() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [about, setAbout] = useState<AboutContentWithImages | null>(null);

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
    <section className="page-container py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Stessa foto della pagina "Chi siamo", gestita da Admin → Chi siamo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={about.main_image_url || DEFAULT_ABOUT_MAIN_IMAGE}
          alt=""
          aria-hidden="true"
          className="aspect-[3/2] w-full rounded-2xl object-cover"
        />
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
