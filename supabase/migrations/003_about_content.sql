-- Contenuto della pagina "Chi siamo", gestibile dall'admin.
-- Riga singola con traduzioni per lingua (stesso pattern di services.translations).

create table public.about_content (
    id integer primary key default 1,
    translations jsonb not null default '{}'::jsonb,
    constraint about_content_singleton check (id = 1)
);

alter table public.about_content enable row level security;

create policy "Chiunque legge il contenuto di Chi siamo"
    on public.about_content for select
    using (true);

create policy "Admin gestisce il contenuto di Chi siamo"
    on public.about_content for all
    using (public.is_admin())
    with check (public.is_admin());

insert into public.about_content (id, translations) values (1, $json$
{
  "it": {
    "title": "Chi siamo",
    "intro": "ImmoAdvisor nasce dall'esperienza sul campo di Carmine, professionista immobiliare attivo in Svizzera da anni, che ha visto troppi proprietari pagare pacchetti di servizi gonfiati e poco trasparenti per vendere casa. Da qui l'idea: una piattaforma dove sei tu a scegliere esattamente i servizi di cui hai bisogno — annuncio, fotografie, documentazione, valutazione — senza vincoli e con il totale sempre visibile.",
    "value1_title": "Trasparenza",
    "value1_text": "Ogni servizio ha un prezzo chiaro, definito prima di acquistare. Nessuna sorpresa in fattura.",
    "value2_title": "Su misura",
    "value2_text": "Scegli solo quello che ti serve davvero: non pacchetti preconfezionati, ma un configuratore pensato attorno alla tua vendita.",
    "value3_title": "Esperienza sul territorio",
    "value3_text": "Anni di esperienza nel mercato immobiliare svizzero, per un servizio che conosce davvero le esigenze locali.",
    "cta_title": "Hai domande?",
    "cta_text": "Scrivici, siamo felici di aiutarti a scegliere i servizi giusti per la tua vendita.",
    "cta_button": "Contattaci"
  },
  "en": {
    "title": "About us",
    "intro": "ImmoAdvisor was born from the hands-on experience of Carmine, a real estate professional active in Switzerland for years, who saw too many property owners pay for bloated, opaque service packages when selling their home. That's where the idea came from: a platform where you choose exactly the services you need — listing, photography, documentation, valuation — with no strings attached and the total always visible.",
    "value1_title": "Transparency",
    "value1_text": "Every service has a clear price, set before you buy. No surprises on the invoice.",
    "value2_title": "Tailored to you",
    "value2_text": "Choose only what you really need: not pre-packaged bundles, but a configurator built around your sale.",
    "value3_title": "Local expertise",
    "value3_text": "Years of experience in the Swiss real estate market, for a service that truly understands local needs.",
    "cta_title": "Have questions?",
    "cta_text": "Write to us, we're happy to help you choose the right services for your sale.",
    "cta_button": "Contact us"
  },
  "de": {
    "title": "Über uns",
    "intro": "ImmoAdvisor entstand aus der praktischen Erfahrung von Carmine, seit Jahren als Immobilienprofi in der Schweiz tätig, der zu oft sah, wie Eigentümer für aufgeblähte, intransparente Servicepakete beim Hausverkauf bezahlten. Daraus entstand die Idee: eine Plattform, auf der Sie genau die Dienstleistungen wählen, die Sie brauchen — Inserat, Fotografie, Unterlagen, Bewertung — ganz ohne Verpflichtung und mit stets sichtbarer Summe.",
    "value1_title": "Transparenz",
    "value1_text": "Jede Dienstleistung hat einen klaren Preis, festgelegt vor dem Kauf. Keine Überraschungen auf der Rechnung.",
    "value2_title": "Massgeschneidert",
    "value2_text": "Wählen Sie nur, was Sie wirklich brauchen: keine vorgefertigten Pakete, sondern ein Konfigurator rund um Ihren Verkauf.",
    "value3_title": "Lokale Erfahrung",
    "value3_text": "Jahrelange Erfahrung auf dem Schweizer Immobilienmarkt, für einen Service, der die lokalen Bedürfnisse wirklich kennt.",
    "cta_title": "Haben Sie Fragen?",
    "cta_text": "Schreiben Sie uns, wir helfen Ihnen gerne, die richtigen Dienstleistungen für Ihren Verkauf zu wählen.",
    "cta_button": "Kontaktieren Sie uns"
  },
  "fr": {
    "title": "À propos",
    "intro": "ImmoAdvisor est né de l'expérience de terrain de Carmine, professionnel de l'immobilier actif en Suisse depuis des années, qui a vu trop de propriétaires payer des forfaits de services gonflés et peu transparents pour vendre leur bien. D'où l'idée : une plateforme où c'est vous qui choisissez exactement les services dont vous avez besoin — annonce, photographie, documentation, évaluation — sans engagement et avec le total toujours visible.",
    "value1_title": "Transparence",
    "value1_text": "Chaque service a un prix clair, défini avant l'achat. Aucune surprise sur la facture.",
    "value2_title": "Sur mesure",
    "value2_text": "Choisissez uniquement ce dont vous avez vraiment besoin : pas de forfaits préconçus, mais un configurateur pensé autour de votre vente.",
    "value3_title": "Expertise locale",
    "value3_text": "Des années d'expérience sur le marché immobilier suisse, pour un service qui connaît vraiment les besoins locaux.",
    "cta_title": "Des questions ?",
    "cta_text": "Écrivez-nous, nous serons heureux de vous aider à choisir les bons services pour votre vente.",
    "cta_button": "Contactez-nous"
  }
}
$json$::jsonb);
