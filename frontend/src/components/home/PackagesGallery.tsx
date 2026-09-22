"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useSalesPackages } from "@/features/salesPackages/useSalesPackages";
import { PackageCard } from "@/components/configurator/PackageCard";
import { Button } from "@/components/ui/Button";

export function PackagesGallery() {
  const t = useTranslations("Home");
  const { packages, content, isLoading } = useSalesPackages();
  const topPackages = packages.slice(0, 3);

  if (!isLoading && (topPackages.length === 0 || !content)) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {t("packagesGalleryTitle")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">
          {t("packagesGallerySubtitle")}
        </p>
      </div>

      {!isLoading && content && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {topPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} buyLabel={content.buyLabel} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/configuratore">
          <Button variant="secondary">{t("packagesGalleryCta")}</Button>
        </Link>
      </div>
    </section>
  );
}
