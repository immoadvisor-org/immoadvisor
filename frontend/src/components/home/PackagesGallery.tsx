"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useSalesPackages } from "@/features/salesPackages/useSalesPackages";
import { PackageGalleryRow } from "@/components/configurator/PackageGalleryRow";
import { Button } from "@/components/ui/Button";

export function PackagesGallery() {
  const t = useTranslations("Home");
  const { packages, content, isLoading } = useSalesPackages();
  const topPackages = packages.slice(0, 3);

  if (!isLoading && (topPackages.length === 0 || !content)) return null;

  return (
    <section className="py-16">
      <div className="page-container text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {t("packagesGalleryTitle")}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">
          {t("packagesGallerySubtitle")}
        </p>
      </div>

      {!isLoading && content && (
        <div className="mt-12">
          <PackageGalleryRow packages={topPackages} buyLabel={content.buyLabel} />
        </div>
      )}

      <div className="mt-10 px-4 text-center">
        <Link href="/configuratore">
          <Button variant="secondary">{t("packagesGalleryCta")}</Button>
        </Link>
      </div>
    </section>
  );
}
