-- Contenuto testuale della pagina "Pacchetti di vendita" (titolo,
-- sottotitolo, tabella di confronto, note, etichetta del pulsante
-- d'acquisto). Stesso pattern di how_it_works_content: singleton con
-- traduzioni annidate in JSONB.
--
-- I pacchetti veri e propri (Basic / Medium / All Inclusive, con nome,
-- prezzo e funzionalità) NON stanno qui: vivono nella tabella
-- public.sales_packages (vedi 017_sales_packages_catalog.sql), gestibile
-- dall'admin esattamente come public.services — così se ne possono
-- aggiungere, rimuovere o riordinare senza limiti.
--
-- Struttura di ogni voce { it | en | de | fr }:
-- {
--   "title": string, "subtitle": string,
--   "comparisonRows": [{ "name", "description"?, "individualPrice",
--                          "basic", "medium", "allInclusive" }],
--     (per basic/medium/allInclusive: "check" = incluso, "" = non incluso,
--      qualsiasi altro testo viene mostrato cosi' com'e', es. "Standard")
--   "monthlyFeeLabel": string,
--   "notes": string[],
--   "buyLabel": string
-- }

create table public.sales_packages_content (
    id integer primary key default 1,
    translations jsonb not null default '{}'::jsonb,
    constraint sales_packages_content_singleton check (id = 1)
);

alter table public.sales_packages_content enable row level security;

create policy "Chiunque legge i pacchetti di vendita"
    on public.sales_packages_content for select
    using (true);

create policy "Admin gestisce i pacchetti di vendita"
    on public.sales_packages_content for all
    using (public.is_admin())
    with check (public.is_admin());

insert into public.sales_packages_content (id, translations) values (1, $json$
{
  "de": {
    "title": "Verkaufspakete",
    "subtitle": "Wählen Sie das passende Rundum-Paket für den Verkauf Ihrer Immobilie – oder stellen Sie weiter unten Ihr eigenes Paket aus einzelnen Dienstleistungen zusammen.",
    "comparisonRows": [
      {"name": "Online-Kurzbewertung", "description": "Automatisierte Erstindikation", "individualPrice": "Gratis", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Bewertung vor Ort durch Makler", "description": "Hedonische Bewertung", "individualPrice": "CHF 450.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Verkehrswertschätzung", "description": "Amtliche Schätzung", "individualPrice": "CHF 2'000–3'000.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "GEAK Energieausweis", "description": "", "individualPrice": "CHF 900.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Grundstückgewinnsteuer", "description": "Berechnung", "individualPrice": "CHF 500.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Homestaging", "description": "", "individualPrice": "CHF 390.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Professionelle Fotografie", "description": "", "individualPrice": "CHF 590–990.–", "basic": "Standard", "medium": "Premium", "allInclusive": "Premium"},
      {"name": "Drohnenaufnahmen", "description": "", "individualPrice": "CHF 250.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "3D-Rundgang", "description": "Virtuelle Besichtigung", "individualPrice": "CHF 590.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Grundriss-Erstellung", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Exposé-Erstellung", "description": "Inkl. Verkaufstext, digital", "individualPrice": "CHF 190.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Inserat auf Immobilienportalen", "description": "Homegate, ImmoScout24, Comparis", "individualPrice": "CHF 590.–/Wo.", "basic": "Standard", "medium": "+ Boost", "allInclusive": "+ Premium"},
      {"name": "Reservationsvereinbarung", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Kaufvertragsentwurf", "description": "Bestellung & Koordination", "individualPrice": "auf Anfrage", "basic": "check", "medium": "check", "allInclusive": "check"}
    ],
    "monthlyFeeLabel": "Monatliche Servicepauschale",
    "notes": [
      "Die Mandatsdauer für die Preisrechnung ist mit ca. 4 Monaten bis zum Verkaufsabschluss angenommen.",
      "Notariats- und Grundbuchgebühren, Handänderungssteuer sowie allfällige Maklercourtage sind nicht im Paketpreis enthalten und werden separat ausgewiesen — abhängig vom Kanton und Verkaufspreis der Liegenschaft.",
      "Einzelleistungen aus der Vergleichstabelle lassen sich jedem Paket nachträglich hinzufügen, zum ausgewiesenen Einzelpreis, ohne das Paket zu wechseln."
    ],
    "buyLabel": "Dieses Paket kaufen"
  },
  "it": {
    "title": "Pacchetti di vendita",
    "subtitle": "Scegli il pacchetto tutto compreso più adatto per vendere il tuo immobile — oppure componi più sotto la tua soluzione su misura scegliendo i singoli servizi.",
    "comparisonRows": [
      {"name": "Valutazione online rapida", "description": "Prima indicazione automatizzata", "individualPrice": "Gratuito", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Valutazione in loco da parte dell'agente", "description": "Valutazione edonica", "individualPrice": "CHF 450.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Perizia del valore di mercato", "description": "Perizia ufficiale", "individualPrice": "CHF 2'000–3'000.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Attestato energetico GEAK", "description": "", "individualPrice": "CHF 900.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Imposta sull'utile immobiliare", "description": "Calcolo", "individualPrice": "CHF 500.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Home staging", "description": "", "individualPrice": "CHF 390.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Fotografia professionale", "description": "", "individualPrice": "CHF 590–990.–", "basic": "Standard", "medium": "Premium", "allInclusive": "Premium"},
      {"name": "Riprese con drone", "description": "", "individualPrice": "CHF 250.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Tour virtuale 3D", "description": "Visita virtuale", "individualPrice": "CHF 590.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Creazione planimetria", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Creazione esposé", "description": "Incl. testo di vendita, digitale", "individualPrice": "CHF 190.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Inserzione su portali immobiliari", "description": "Homegate, ImmoScout24, Comparis", "individualPrice": "CHF 590.–/sett.", "basic": "Standard", "medium": "+ Boost", "allInclusive": "+ Premium"},
      {"name": "Accordo di riservazione", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Bozza contratto di vendita", "description": "Ordinazione e coordinamento", "individualPrice": "su richiesta", "basic": "check", "medium": "check", "allInclusive": "check"}
    ],
    "monthlyFeeLabel": "Quota di servizio mensile",
    "notes": [
      "La durata del mandato considerata per il calcolo dei prezzi è di circa 4 mesi fino alla conclusione della vendita.",
      "Le spese notarili e di registro fondiario, l'imposta di trasferimento e un'eventuale provvigione di mediazione non sono incluse nel prezzo del pacchetto e vengono indicate separatamente, in base al Cantone e al prezzo di vendita dell'immobile.",
      "Ogni prestazione della tabella di confronto può essere aggiunta in un secondo momento a qualsiasi pacchetto, al prezzo indicato, senza dover cambiare pacchetto."
    ],
    "buyLabel": "Acquista questo pacchetto"
  },
  "en": {
    "title": "Sales Packages",
    "subtitle": "Choose the all-in-one package that best fits selling your property — or build your own tailored solution below by picking individual services.",
    "comparisonRows": [
      {"name": "Quick online valuation", "description": "Automated first estimate", "individualPrice": "Free", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "On-site valuation by an agent", "description": "Hedonic valuation", "individualPrice": "CHF 450.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Market value appraisal", "description": "Official appraisal", "individualPrice": "CHF 2,000–3,000.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "GEAK energy certificate", "description": "", "individualPrice": "CHF 900.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Real estate capital gains tax", "description": "Calculation", "individualPrice": "CHF 500.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Home staging", "description": "", "individualPrice": "CHF 390.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Professional photography", "description": "", "individualPrice": "CHF 590–990.–", "basic": "Standard", "medium": "Premium", "allInclusive": "Premium"},
      {"name": "Drone footage", "description": "", "individualPrice": "CHF 250.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "3D walkthrough", "description": "Virtual viewing", "individualPrice": "CHF 590.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Floor plan creation", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Listing description creation", "description": "Incl. sales copy, digital", "individualPrice": "CHF 190.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Listing on real estate portals", "description": "Homegate, ImmoScout24, Comparis", "individualPrice": "CHF 590.–/week", "basic": "Standard", "medium": "+ Boost", "allInclusive": "+ Premium"},
      {"name": "Reservation agreement", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Sales contract draft", "description": "Order & coordination", "individualPrice": "on request", "basic": "check", "medium": "check", "allInclusive": "check"}
    ],
    "monthlyFeeLabel": "Monthly service fee",
    "notes": [
      "The mandate duration used for the price calculation is assumed to be approx. 4 months until the sale is completed.",
      "Notary and land registry fees, real estate transfer tax and any brokerage commission are not included in the package price and are billed separately, depending on the canton and the property's sale price.",
      "Any individual service from the comparison table can be added to any package afterwards, at the listed individual price, without switching packages."
    ],
    "buyLabel": "Buy this package"
  },
  "fr": {
    "title": "Forfaits de vente",
    "subtitle": "Choisissez le forfait tout compris le mieux adapté à la vente de votre bien — ou composez plus bas votre propre solution en sélectionnant des services individuels.",
    "comparisonRows": [
      {"name": "Estimation rapide en ligne", "description": "Première indication automatisée", "individualPrice": "Gratuit", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Estimation sur place par un courtier", "description": "Évaluation hédonique", "individualPrice": "CHF 450.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Estimation de la valeur vénale", "description": "Expertise officielle", "individualPrice": "CHF 2'000–3'000.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Certificat énergétique cantonal (CECB)", "description": "", "individualPrice": "CHF 900.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Impôt sur les gains immobiliers", "description": "Calcul", "individualPrice": "CHF 500.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Home staging", "description": "", "individualPrice": "CHF 390.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Photographie professionnelle", "description": "", "individualPrice": "CHF 590–990.–", "basic": "Standard", "medium": "Premium", "allInclusive": "Premium"},
      {"name": "Prises de vue par drone", "description": "", "individualPrice": "CHF 250.–", "basic": "", "medium": "check", "allInclusive": "check"},
      {"name": "Visite virtuelle 3D", "description": "Visite virtuelle", "individualPrice": "CHF 590.–", "basic": "", "medium": "", "allInclusive": "check"},
      {"name": "Création du plan", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Création du descriptif", "description": "Texte de vente inclus, numérique", "individualPrice": "CHF 190.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Annonce sur les portails immobiliers", "description": "Homegate, ImmoScout24, Comparis", "individualPrice": "CHF 590.–/sem.", "basic": "Standard", "medium": "+ Boost", "allInclusive": "+ Premium"},
      {"name": "Convention de réservation", "description": "", "individualPrice": "CHF 250.–", "basic": "check", "medium": "check", "allInclusive": "check"},
      {"name": "Projet de contrat de vente", "description": "Commande & coordination", "individualPrice": "sur demande", "basic": "check", "medium": "check", "allInclusive": "check"}
    ],
    "monthlyFeeLabel": "Forfait de service mensuel",
    "notes": [
      "La durée du mandat retenue pour le calcul des prix est estimée à environ 4 mois jusqu'à la conclusion de la vente.",
      "Les frais de notaire et de registre foncier, les droits de mutation ainsi qu'une éventuelle commission de courtage ne sont pas inclus dans le prix du forfait et sont facturés séparément, selon le canton et le prix de vente du bien.",
      "Chaque prestation du tableau comparatif peut être ajoutée ultérieurement à n'importe quel forfait, au prix unitaire indiqué, sans changer de forfait."
    ],
    "buyLabel": "Acheter ce forfait"
  }
}
$json$::jsonb);

-- Il testo "So funktioniert's" affermava che non esistono pacchetti fissi;
-- ora che i pacchetti Basic/Medium/All Inclusive esistono, il testo viene
-- corretto per menzionare entrambe le opzioni.
update how_it_works_content
set translations = jsonb_set(
    translations,
    '{it,text}',
    '"Scegli uno dei pacchetti pronti Basic, Medium o All Inclusive, oppure sfoglia i servizi disponibili — annuncio, fotografie, documentazione, valutazione e altro — e componi il tuo pacchetto su misura, con il totale aggiornato in tempo reale."'::jsonb,
    true
)
where id = 1 and translations ? 'it';

update how_it_works_content
set translations = jsonb_set(
    translations,
    '{en,text}',
    '"Choose one of the ready-made Basic, Medium or All Inclusive packages, or browse the available services — listing, photography, documentation, valuation and more — and build your own tailored package, with the total updating live."'::jsonb,
    true
)
where id = 1 and translations ? 'en';

update how_it_works_content
set translations = jsonb_set(
    translations,
    '{de,text}',
    '"Wählen Sie eines der fertigen Pakete Basic, Medium oder All Inclusive, oder durchstöbern Sie die verfügbaren Dienstleistungen — Inserat, Fotografie, Unterlagen, Bewertung und mehr — und stellen Sie Ihr eigenes Paket zusammen, mit der Summe in Echtzeit."'::jsonb,
    true
)
where id = 1 and translations ? 'de';

update how_it_works_content
set translations = jsonb_set(
    translations,
    '{fr,text}',
    '"Choisissez l''un des forfaits prêts à l''emploi Basic, Medium ou All Inclusive, ou parcourez les services disponibles — annonce, photographie, documentation, évaluation et plus encore — et composez votre propre forfait, avec le total mis à jour en temps réel."'::jsonb,
    true
)
where id = 1 and translations ? 'fr';
