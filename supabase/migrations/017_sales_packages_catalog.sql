-- ============================================================
-- sales_packages: pacchetti di vendita acquistabili direttamente (Basic,
-- Medium, All Inclusive...), gestiti dall'admin esattamente come
-- public.services — stesso pattern, così se ne possono aggiungere,
-- nascondere, riordinare o eliminare liberamente, senza limite ai 3
-- pacchetti iniziali.
-- Nome ed elenco funzionalità sono multilingua in "translations":
-- { "it": {"name": ..., "featuredLabel": ..., "includesLabel": ...,
--           "features": ["...", ...]}, "en": {...}, "de": {...}, "fr": {...} }
-- ============================================================
create table public.sales_packages (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    monthly_price_chf numeric(10, 2) not null check (monthly_price_chf >= 0),
    featured boolean not null default false,
    active boolean not null default true,
    display_order integer not null default 0,
    translations jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.sales_packages enable row level security;

create policy "Chiunque legge i pacchetti attivi"
    on public.sales_packages for select
    using (active = true);

create policy "Admin gestisce i pacchetti"
    on public.sales_packages for all
    using (public.is_admin())
    with check (public.is_admin());

create index idx_sales_packages_display_order on public.sales_packages (display_order);

insert into public.sales_packages (slug, monthly_price_chf, featured, display_order, translations) values
('basic', 990.00, false, 10, $json$
{
  "de": {
    "name": "Basic",
    "features": ["Online-Kurzbewertung", "Grundriss-Erstellung", "Professionelle Fotografie (Standard)", "Exposé & Verkaufstext (digital)", "Inserat auf 3 Portalen (Homegate, ImmoScout24, Comparis)", "Reservationsvereinbarung", "Koordination Kaufvertragsentwurf"]
  },
  "it": {
    "name": "Basic",
    "features": ["Valutazione online rapida", "Creazione planimetria", "Fotografia professionale (Standard)", "Esposé e testo di vendita (digitale)", "Inserzione su 3 portali (Homegate, ImmoScout24, Comparis)", "Accordo di riservazione", "Coordinamento bozza contratto di vendita"]
  },
  "en": {
    "name": "Basic",
    "features": ["Quick online valuation", "Floor plan creation", "Professional photography (Standard)", "Listing description & sales copy (digital)", "Listing on 3 portals (Homegate, ImmoScout24, Comparis)", "Reservation agreement", "Sales contract draft coordination"]
  },
  "fr": {
    "name": "Basic",
    "features": ["Estimation rapide en ligne", "Création du plan", "Photographie professionnelle (Standard)", "Descriptif & texte de vente (numérique)", "Annonce sur 3 portails (Homegate, ImmoScout24, Comparis)", "Convention de réservation", "Coordination du projet de contrat de vente"]
  }
}
$json$::jsonb);

insert into public.sales_packages (slug, monthly_price_chf, featured, display_order, translations) values
('medium', 1950.00, true, 20, $json$
{
  "de": {
    "name": "Medium",
    "featuredLabel": "Meistgewählt",
    "includesLabel": "Alles aus Basic, plus",
    "features": ["Bewertung vor Ort durch Makler", "Fotografie-Upgrade (Premium)", "Homestaging", "Drohnenaufnahmen", "GEAK Energieausweis", "Wöchentliches Auffrischen & Reichweiten-Boost"]
  },
  "it": {
    "name": "Medium",
    "featuredLabel": "Più scelto",
    "includesLabel": "Tutto da Basic, più",
    "features": ["Valutazione in loco da parte dell'agente", "Fotografia Premium", "Home staging", "Riprese con drone", "Attestato energetico GEAK", "Aggiornamento settimanale e boost di visibilità"]
  },
  "en": {
    "name": "Medium",
    "featuredLabel": "Most chosen",
    "includesLabel": "Everything in Basic, plus",
    "features": ["On-site valuation by an agent", "Photography upgrade (Premium)", "Home staging", "Drone footage", "GEAK energy certificate", "Weekly refresh & reach boost"]
  },
  "fr": {
    "name": "Medium",
    "featuredLabel": "Le plus choisi",
    "includesLabel": "Tout Basic, plus",
    "features": ["Estimation sur place par un courtier", "Photographie Premium", "Home staging", "Prises de vue par drone", "Certificat énergétique cantonal (CECB)", "Actualisation hebdomadaire & boost de visibilité"]
  }
}
$json$::jsonb);

insert into public.sales_packages (slug, monthly_price_chf, featured, display_order, translations) values
('all-inclusive', 2990.00, false, 30, $json$
{
  "de": {
    "name": "All Inclusive",
    "includesLabel": "Alles aus Medium, plus",
    "features": ["Amtliche Verkehrswertschätzung", "3D-Rundgang / virtuelle Besichtigung", "Berechnung Grundstückgewinnsteuer", "Premium-Platzierung auf allen Portalen", "Persönliche Verkaufsbegleitung bis zur Beurkundung"]
  },
  "it": {
    "name": "All Inclusive",
    "includesLabel": "Tutto da Medium, più",
    "features": ["Perizia ufficiale del valore di mercato", "Tour virtuale 3D", "Calcolo dell'imposta sull'utile immobiliare", "Posizionamento Premium su tutti i portali", "Assistenza personale alla vendita fino al rogito"]
  },
  "en": {
    "name": "All Inclusive",
    "includesLabel": "Everything in Medium, plus",
    "features": ["Official market value appraisal", "3D walkthrough / virtual viewing", "Real estate capital gains tax calculation", "Premium placement on all portals", "Personal sales support through to notarization"]
  },
  "fr": {
    "name": "All Inclusive",
    "includesLabel": "Tout Medium, plus",
    "features": ["Estimation officielle de la valeur vénale", "Visite virtuelle 3D", "Calcul de l'impôt sur les gains immobiliers", "Placement Premium sur tous les portails", "Accompagnement personnel jusqu'à la signature notariée"]
  }
}
$json$::jsonb);
