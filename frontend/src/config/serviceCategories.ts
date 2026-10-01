import type { Service } from "@/features/services/types";

// Configurazione dei gruppi di servizi nel configuratore. Le categorie sono
// quelle impostate in Admin → Servizi (campo "Categoria").
export const SERVICE_CATEGORIES_CONFIG = {
  // Solo vista a lista (la griglia non si raggruppa mai). false = servizi in un unico elenco, come prima.
  groupByCategory: true,

  // Solo vista a lista, con i gruppi attivi:
  // "single" = un'unica tabella, con il nome della categoria come riga di intestazione;
  // "separate" = una tabella per categoria, con il titolo sopra ognuna.
  // (La vista a blocchi usa sempre i titoli sopra ogni gruppo.)
  listGroupLayout: "single" as "single" | "separate",

  // Ordine dei gruppi. Una categoria non elencata qui finisce in fondo, nell'ordine
  // dei servizi definito in admin.
  order: ["legale", "consulenza", "media", "documentazione", "marketing"],

  // Titolo di ogni gruppo per lingua. Senza traduzione si usa il nome della
  // categoria con l'iniziale maiuscola.
  labels: {
    legale: { it: "Legale", en: "Legal", de: "Recht", fr: "Juridique" },
    consulenza: { it: "Consulenza", en: "Consulting", de: "Beratung", fr: "Conseil" },
    documentazione: { it: "Documentazione", en: "Documentation", de: "Dokumentation", fr: "Documentation" },
    media: { it: "Foto e media", en: "Photos & media", de: "Fotos & Medien", fr: "Photos et médias" },
    marketing: { it: "Marketing", en: "Marketing", de: "Marketing", fr: "Marketing" },
  } as Record<string, Partial<Record<string, string>>>,
};

export function serviceCategoryLabel(category: string, locale: string): string {
  return (
    SERVICE_CATEGORIES_CONFIG.labels[category]?.[locale] ?? category.charAt(0).toUpperCase() + category.slice(1)
  );
}

export interface ServiceGroup {
  category: string;
  services: Service[];
}

// Raggruppa i servizi (già ordinati come in admin) secondo la configurazione.
export function groupServicesByCategory(services: Service[]): ServiceGroup[] {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    groups.set(service.category, [...(groups.get(service.category) ?? []), service]);
  }
  const rank = (category: string) => {
    const index = SERVICE_CATEGORIES_CONFIG.order.indexOf(category);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  // sort è stabile: le categorie non configurate restano nell'ordine di comparsa.
  return [...groups.entries()]
    .map(([category, items]) => ({ category, services: items }))
    .sort((a, b) => rank(a.category) - rank(b.category));
}
