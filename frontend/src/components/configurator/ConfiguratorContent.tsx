"use client";

import type { ReactNode } from "react";

import { useSalesPackages } from "@/features/salesPackages/useSalesPackages";
import { useServices } from "@/features/services/useServices";
import { SalesPackages } from "@/components/configurator/SalesPackages";
import { ServiceList } from "@/components/configurator/ServiceList";

// Contenuto del configuratore: pacchetti e servizi arrivano da due chiamate
// separate. Si mostra tutto solo quando entrambe sono concluse, altrimenti
// la sezione più veloce (di solito i servizi) compare in alto per un attimo
// e poi viene spinta giù dai pacchetti. Durante il caricamento lo spazio
// resta riservato, così anche il footer non salta.
export function ConfiguratorContent({ servicesIntro }: { servicesIntro: ReactNode }) {
  const salesPackages = useSalesPackages();
  const services = useServices();

  if (salesPackages.isLoading || services.isLoading) {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  return (
    <>
      <div className="py-12">
        {!salesPackages.error && <SalesPackages packages={salesPackages.packages} content={salesPackages.content} />}
      </div>

      <div className="page-container pb-12">
        {servicesIntro}
        <div className="mt-10">
          <ServiceList services={services.services} error={services.error} />
        </div>
      </div>
    </>
  );
}
