import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  const t = useTranslations("About");

  const values = [
    { title: t("value1Title"), text: t("value1Text") },
    { title: t("value2Title"), text: t("value2Text") },
    { title: t("value3Title"), text: t("value3Text") },
  ];

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {t("intro")}
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
          {t("valuesTitle")}
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
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{t("ctaText")}</p>
          <Link href="/contact" className="mt-6 inline-block">
            <Button>{t("ctaButton")}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
