"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import type { SalesPackage } from "@/features/salesPackages/salesPackagesApi";

// Illustrazione di sfondo per pacchetto (stesso ruolo della foto auto nelle
// card Tesla): una sola immagine copre l'intera card, con il testo in
// sovraimpressione. Una per slug, con fallback su "basic" per eventuali
// pacchetti futuri non ancora coperti da un'illustrazione dedicata.
const PACKAGE_IMAGES: Record<string, string> = {
  basic: "/packages/package-basic.svg",
  medium: "/packages/package-medium.svg",
  "all-inclusive": "/packages/package-all-inclusive.svg",
};

function packageImageSrc(slug: string): string {
  return PACKAGE_IMAGES[slug] ?? PACKAGE_IMAGES.basic;
}

// Chiave di traduzione per la brevissima descrizione in alto a sinistra
// nella card (come su Tesla), una per slug.
const TAGLINE_KEYS: Record<string, string> = {
  basic: "taglineBasic",
  medium: "taglineMedium",
  "all-inclusive": "taglineAllInclusive",
};

export function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-amber-300"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function PackageCard({ pkg, buyLabel }: { pkg: SalesPackage; buyLabel: string }) {
  const t = useTranslations("SalesPackages");
  // Il PDF descrive i pacchetti come una quota mensile: il pagamento a rate
  // è quindi proposto per primo (selezionato di default), con il pagamento
  // in un'unica soluzione come alternativa. La scelta fatta qui è solo
  // un'anteprima: il riepilogo prima del pagamento permette di cambiarla.
  const [paymentMode, setPaymentMode] = useState<"installments" | "single">("installments");
  const showPaymentModeToggle = pkg.installments > 1 && pkg.allow_single_payment;
  // Se il pagamento in un'unica soluzione è disattivato per questo
  // pacchetto, non esiste modo di impostare "single" (nessun pulsante lo
  // fa): questo garantisce comunque che il resto del componente non lo usi
  // mai per errore.
  const effectiveMode = showPaymentModeToggle ? paymentMode : "installments";

  const monthlyPrice = Number(pkg.monthly_price_chf);
  const totalPrice = monthlyPrice * pkg.installments;

  const buyButton = (
    <Link href={{ pathname: "/pacchetto", query: { packageId: pkg.id, mode: effectiveMode } }} className="mt-4 block">
      <Button variant="primary">{buyLabel}</Button>
    </Link>
  );

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 ${
        pkg.featured ? "ring-2 ring-brand-400" : "ring-1 ring-white/10"
      }`}
    >
      {/* Una sola immagine di sfondo copre l'intera card (come la foto auto
          su Tesla), con un velo scuro sopra per garantire leggibilità al
          testo chiaro, qualunque sia il contenuto dell'illustrazione. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={packageImageSrc(pkg.slug)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-black/35" />

      {TAGLINE_KEYS[pkg.slug] && (
        <p className="absolute left-6 top-5 text-xs font-medium uppercase tracking-wide text-white/70">
          {t(TAGLINE_KEYS[pkg.slug])}
        </p>
      )}

      <div className="px-6 pb-6 pt-11">
        {/* Come su Tesla: su schermi larghi la card è più alta, con
            nome/prezzo/pulsante ancorati in basso a sinistra (self-end) e il
            contenuto (features) ancorato in alto a destra (self-start).
            Sotto una certa larghezza torna tutto in colonna singola, testo
            sopra e contenuto sotto, con il pulsante spostato in fondo. */}
        <div className="flex flex-col lg:min-h-[340px] lg:flex-row lg:gap-x-10">
          <div className="flex flex-col lg:w-2/5 lg:self-end">
            {pkg.featured && pkg.featured_label && (
              <span className="mb-3 inline-block w-fit rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                {pkg.featured_label}
              </span>
            )}
            <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>

            {showPaymentModeToggle && (
              <div className="mt-3 flex rounded-lg border border-white/25 bg-black/25 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPaymentMode("installments")}
                  className={`flex-1 rounded-md px-2 py-1.5 transition-colors ${
                    effectiveMode === "installments" ? "bg-brand-500 text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {t("paymentModeInstallments", { count: pkg.installments })}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("single")}
                  className={`flex-1 rounded-md px-2 py-1.5 transition-colors ${
                    effectiveMode === "single" ? "bg-brand-500 text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {t("paymentModeSingle")}
                </button>
              </div>
            )}

            <div className={`flex items-baseline gap-1 ${showPaymentModeToggle ? "mt-3" : "mt-4"}`}>
              <PriceTag
                amountChf={effectiveMode === "installments" ? monthlyPrice : totalPrice}
                className="text-2xl font-bold text-white"
              />
              <span className="text-sm text-white/70">
                {effectiveMode === "installments" ? t("perMonth") : t("oneTime")}
              </span>
            </div>
            {effectiveMode === "installments" && pkg.installments > 1 && (
              <p className="mt-1 text-xs text-white/70">
                {t("installmentsBreakdown", { count: pkg.installments, total: totalPrice.toLocaleString("de-CH") })}
              </p>
            )}

            <div className="hidden lg:block">{buyButton}</div>
          </div>

          <div className="mt-6 flex flex-1 flex-col lg:mt-0 lg:self-start">
            {pkg.includes_label && (
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">{pkg.includes_label}</p>
            )}

            <ul className={`space-y-2 ${pkg.includes_label ? "mt-3" : ""}`}>
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-white/90">
                  <span className="mt-0.5 flex-shrink-0">
                    <Check />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:hidden">{buyButton}</div>
      </div>
    </div>
  );
}
