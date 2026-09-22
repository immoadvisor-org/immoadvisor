-- Sostituisce i servizi di esempio inseriti in 001_init.sql con il
-- catalogo reale fornito dal cliente (listino "Verkaufspakete Webmaster"),
-- basato sui prezzi individuali della tabella di confronto dei pacchetti.
-- "Online-Kurzbewertung" (gratuita) e "Kaufvertragsentwurf" (su richiesta,
-- senza prezzo fisso) non vengono inseriti come voci acquistabili a
-- catalogo: compaiono solo come contenuto nella pagina "Pacchetti di
-- vendita" (vedi 016_sales_packages_content.sql).
--
-- I servizi di esempio vengono disattivati, non eliminati: se sono già
-- referenziati da un ordine esistente (order_items.service_id), la
-- cancellazione violerebbe il vincolo di integrità referenziale — stesso
-- motivo per cui l'admin del catalogo permette di disattivare una voce in
-- uso ma non di eliminarla. Disattivarli è comunque sufficiente: non
-- compaiono più nel configuratore (visibile solo active = true).

update public.services
set active = false
where slug in (
    'annuncio-immoscout',
    'servizio-fotografico',
    'documentazione-vendita',
    'planimetria-3d',
    'valutazione-immobile'
);

insert into public.services (slug, category, price_chf, display_order, translations) values
('bewertung-vor-ort', 'consulenza', 450.00, 10, $json$
{
  "it": {"name": "Valutazione in loco da parte dell'agente", "description": "Valutazione edonica dell'immobile eseguita da un agente esperto direttamente sul posto."},
  "en": {"name": "On-site valuation by an agent", "description": "Hedonic valuation of your property carried out on site by an experienced agent."},
  "de": {"name": "Bewertung vor Ort durch Makler", "description": "Hedonische Bewertung Ihrer Immobilie durch einen erfahrenen Makler vor Ort."},
  "fr": {"name": "Estimation sur place par un courtier", "description": "Évaluation hédonique de votre bien réalisée sur place par un courtier expérimenté."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('verkehrswertschaetzung', 'consulenza', 2500.00, 20, $json$
{
  "it": {"name": "Perizia ufficiale del valore di mercato", "description": "Stima ufficiale del valore di mercato del tuo immobile; prezzo variabile in base all'oggetto (CHF 2'000–3'000)."},
  "en": {"name": "Official market value appraisal", "description": "Official appraisal of your property's market value; price varies by property (CHF 2,000–3,000)."},
  "de": {"name": "Amtliche Verkehrswertschätzung", "description": "Offizielle Schätzung des Verkehrswerts Ihrer Immobilie, Preis abhängig vom Objekt (CHF 2'000–3'000)."},
  "fr": {"name": "Estimation officielle de la valeur vénale", "description": "Expertise officielle de la valeur vénale de votre bien ; prix variable selon l'objet (CHF 2'000–3'000)."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('geak-energieausweis', 'documentazione', 900.00, 30, $json$
{
  "it": {"name": "Attestato energetico GEAK", "description": "Redazione dell'attestato energetico cantonale per edifici (GEAK)."},
  "en": {"name": "GEAK energy certificate", "description": "Preparation of the cantonal building energy certificate (GEAK)."},
  "de": {"name": "GEAK Energieausweis", "description": "Erstellung des kantonalen Energieausweises für Gebäude (GEAK)."},
  "fr": {"name": "Certificat énergétique cantonal (CECB)", "description": "Établissement du certificat énergétique cantonal des bâtiments (CECB/GEAK)."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('grundstueckgewinnsteuer', 'consulenza', 500.00, 40, $json$
{
  "it": {"name": "Calcolo dell'imposta sull'utile immobiliare", "description": "Calcolo dell'imposta sull'utile immobiliare dovuta in caso di vendita."},
  "en": {"name": "Real estate capital gains tax calculation", "description": "Calculation of the real estate capital gains tax due upon sale."},
  "de": {"name": "Berechnung Grundstückgewinnsteuer", "description": "Berechnung der bei Verkauf anfallenden Grundstückgewinnsteuer."},
  "fr": {"name": "Calcul de l'impôt sur les gains immobiliers", "description": "Calcul de l'impôt sur les gains immobiliers dû lors de la vente."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('homestaging', 'media', 390.00, 50, $json$
{
  "it": {"name": "Home staging", "description": "Allestimento e messa in scena professionale dell'immobile per favorirne la vendita."},
  "en": {"name": "Home staging", "description": "Professional furnishing and styling of the property to boost its sale appeal."},
  "de": {"name": "Homestaging", "description": "Professionelle Möblierung und Inszenierung der Immobilie zur Verkaufsförderung."},
  "fr": {"name": "Home staging", "description": "Mise en valeur et aménagement professionnel du bien pour favoriser sa vente."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('fotografie-professionell', 'media', 790.00, 60, $json$
{
  "it": {"name": "Fotografia professionale", "description": "Servizio fotografico dell'immobile; qualità Standard o Premium (CHF 590–990)."},
  "en": {"name": "Professional photography", "description": "Property photo shoot; Standard or Premium quality (CHF 590–990)."},
  "de": {"name": "Professionelle Fotografie", "description": "Fotoshooting der Immobilie; Standard- oder Premium-Qualität (CHF 590–990)."},
  "fr": {"name": "Photographie professionnelle", "description": "Séance photo du bien ; qualité Standard ou Premium (CHF 590–990)."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('drohnenaufnahmen', 'media', 250.00, 70, $json$
{
  "it": {"name": "Riprese con drone", "description": "Riprese aeree dell'immobile e del terreno effettuate con drone."},
  "en": {"name": "Drone footage", "description": "Aerial footage of the property and land captured by drone."},
  "de": {"name": "Drohnenaufnahmen", "description": "Luftaufnahmen der Immobilie und des Grundstücks per Drohne."},
  "fr": {"name": "Prises de vue par drone", "description": "Prises de vue aériennes du bien et du terrain réalisées par drone."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('3d-rundgang', 'media', 590.00, 80, $json$
{
  "it": {"name": "Tour virtuale 3D", "description": "Tour virtuale 3D interattivo per visite a distanza."},
  "en": {"name": "3D walkthrough / virtual viewing", "description": "Interactive 3D walkthrough for virtual property viewings."},
  "de": {"name": "3D-Rundgang / Virtuelle Besichtigung", "description": "Interaktiver 3D-Rundgang für virtuelle Besichtigungen."},
  "fr": {"name": "Visite virtuelle 3D", "description": "Visite virtuelle 3D interactive pour des visites à distance."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('grundriss-erstellung', 'documentazione', 250.00, 90, $json$
{
  "it": {"name": "Creazione planimetria", "description": "Rilievo e creazione di una planimetria in scala."},
  "en": {"name": "Floor plan creation", "description": "Survey and creation of a to-scale floor plan."},
  "de": {"name": "Grundriss-Erstellung", "description": "Vermessung und Erstellung eines massstabsgetreuen Grundrisses."},
  "fr": {"name": "Création du plan", "description": "Relevé et création d'un plan à l'échelle."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('expose-erstellung', 'marketing', 190.00, 100, $json$
{
  "it": {"name": "Creazione esposé", "description": "Redazione dell'esposé e del testo di vendita, in formato digitale."},
  "en": {"name": "Listing description creation", "description": "Creation of the property brochure and sales copy, digital."},
  "de": {"name": "Exposé-Erstellung", "description": "Erstellung von Exposé und Verkaufstext, digital."},
  "fr": {"name": "Création du descriptif", "description": "Rédaction du descriptif et du texte de vente, au format numérique."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('inserat-immobilienportale', 'marketing', 590.00, 110, $json$
{
  "it": {"name": "Inserzione su portali immobiliari (a settimana)", "description": "Pubblicazione su Homegate, ImmoScout24 e Comparis, fatturata a settimana."},
  "en": {"name": "Listing on real estate portals (per week)", "description": "Publication on Homegate, ImmoScout24 and Comparis, billed per week."},
  "de": {"name": "Inserat auf Immobilienportalen (pro Woche)", "description": "Veröffentlichung auf Homegate, ImmoScout24 und Comparis, abgerechnet pro Woche."},
  "fr": {"name": "Annonce sur les portails immobiliers (par semaine)", "description": "Publication sur Homegate, ImmoScout24 et Comparis, facturée à la semaine."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('reservationsvereinbarung', 'documentazione', 250.00, 120, $json$
{
  "it": {"name": "Accordo di riservazione", "description": "Redazione di un accordo di riservazione giuridicamente valido con l'acquirente."},
  "en": {"name": "Reservation agreement", "description": "Drafting of a legally sound reservation agreement with the buyer."},
  "de": {"name": "Reservationsvereinbarung", "description": "Erstellung einer rechtssicheren Reservationsvereinbarung mit dem Käufer."},
  "fr": {"name": "Convention de réservation", "description": "Rédaction d'une convention de réservation juridiquement valable avec l'acheteur."}
}
$json$::jsonb);
