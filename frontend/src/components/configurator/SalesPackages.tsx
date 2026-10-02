"use client";

import { useTranslations } from "next-intl";

import { PriceTag } from "@/components/ui/PriceTag";
import type { SalesPackage, SalesPackagesContent } from "@/features/salesPackages/salesPackagesApi";
import { Check } from "@/components/configurator/PackageCard";
import { PackageGalleryRow } from "@/components/configurator/PackageGalleryRow";

// La tabella di confronto (14 righe di funzionalità) è un contenuto fisso a
// 3 colonne Basic/Medium/All Inclusive, indipendente dal numero di
// pacchetti realmente in catalogo: se l'admin aggiunge o rimuove pacchetti,
// le card sopra si aggiornano subito, la tabella resta un confronto
// descrittivo dei 3 livelli storici (aggiornabile a parte in futuro se
// serve renderla anch'essa dinamica).
const COMPARISON_COLUMNS: { key: "basic" | "medium" | "allInclusive"; slug: string; fallback: string }[] = [
  { key: "basic", slug: "basic", fallback: "Basic" },
  { key: "medium", slug: "medium", fallback: "Medium" },
  { key: "allInclusive", slug: "all-inclusive", fallback: "All Inclusive" },
];

function ComparisonCell({ value }: { value: string }) {
  if (value === "check") {
    return <Check />;
  }
  if (!value) {
    return <span className="text-slate-300 dark:text-neutral-700">–</span>;
  }
  return <span className="text-sm font-medium text-slate-700 dark:text-neutral-200">{value}</span>;
}

interface SalesPackagesProps {
  packages: SalesPackage[];
  content: SalesPackagesContent | null;
}

// I dati arrivano già caricati da ConfiguratorContent: così la pagina appare
// tutta insieme, senza sezioni che compaiono e spingono giù le altre.
export function SalesPackages({ packages, content }: SalesPackagesProps) {
  const t = useTranslations("SalesPackages");

  if (!content || packages.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-neutral-50 sm:text-3xl">
          {content.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-neutral-300">{content.subtitle}</p>
      </div>

      {/* Come su Tesla la gallery usa tutta la larghezza dello schermo e cresce
          con lui; titolo, tabella e note restano nel contenitore centrale. */}
      <div className="mt-10">
        <PackageGalleryRow packages={packages} buyLabel={content.buyLabel} />
      </div>

      <div className="page-container">
        <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900">
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-neutral-200">{t("featureColumn")}</th>
                <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-neutral-200">
                  {t("individualPriceColumn")}
                </th>
                {COMPARISON_COLUMNS.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-center font-medium text-slate-700 dark:text-neutral-200">
                    {packages.find((pkg) => pkg.slug === col.slug)?.name ?? col.fallback}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.comparisonRows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-100 last:border-0 dark:border-neutral-800/60"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-neutral-50">{row.name}</p>
                    {row.description && (
                      <p className="text-xs text-slate-500 dark:text-neutral-400">{row.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600 dark:text-neutral-300">{row.individualPrice}</td>
                  {COMPARISON_COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-center">
                      <ComparisonCell value={row[col.key]} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-50 dark:bg-neutral-900">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-neutral-50">
                  {content.monthlyFeeLabel}
                </td>
                <td className="px-4 py-3" />
                {COMPARISON_COLUMNS.map((col) => {
                  const matched = packages.find((pkg) => pkg.slug === col.slug);
                  return (
                    <td key={col.key} className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-neutral-50">
                      {matched ? <PriceTag amountChf={Number(matched.monthly_price_chf)} /> : "–"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {content.notes.length > 0 && (
          <ul className="mt-6 space-y-1.5">
            {content.notes.map((note, index) => (
              <li key={index} className="text-xs leading-relaxed text-slate-500 dark:text-neutral-500">
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
