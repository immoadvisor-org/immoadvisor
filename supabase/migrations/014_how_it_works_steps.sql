-- La sezione "Come funziona" passa da un paragrafo con immagine di sfondo
-- opzionale a un layout a step numerati (senza immagine di sfondo).

alter table how_it_works_content drop column if exists background_image_url;

update how_it_works_content
set translations = jsonb_set(
  translations,
  '{it,steps}',
  '[
    {"title": "Scegli i servizi", "text": "Annuncio, fotografie, documentazione, valutazione: selezioni solo ciò che ti serve davvero."},
    {"title": "Vedi il totale in tempo reale", "text": "Nessun pacchetto fisso: il preventivo si aggiorna a ogni selezione, in franchi svizzeri."},
    {"title": "Ricevi supporto fino alla vendita", "text": "Ogni servizio acquistato viene preso in carico e ti aggiorniamo passo dopo passo."}
  ]'::jsonb,
  true
)
where id = 1 and translations ? 'it';

update how_it_works_content
set translations = jsonb_set(
  translations,
  '{en,steps}',
  '[
    {"title": "Choose your services", "text": "Listing, photography, documentation, valuation: pick only what you actually need."},
    {"title": "See the total update live", "text": "No fixed packages: your quote updates with every choice, in Swiss francs."},
    {"title": "Get support until the sale", "text": "Every service you buy is taken in charge, with updates every step of the way."}
  ]'::jsonb,
  true
)
where id = 1 and translations ? 'en';

update how_it_works_content
set translations = jsonb_set(
  translations,
  '{de,steps}',
  '[
    {"title": "Leistungen auswählen", "text": "Inserat, Fotografie, Unterlagen, Bewertung: Sie wählen nur, was Sie wirklich brauchen."},
    {"title": "Gesamtbetrag live sehen", "text": "Keine festen Pakete: Ihr Angebot aktualisiert sich bei jeder Auswahl, in Schweizer Franken."},
    {"title": "Begleitung bis zum Verkauf", "text": "Jede gebuchte Leistung wird bearbeitet, mit laufenden Updates."}
  ]'::jsonb,
  true
)
where id = 1 and translations ? 'de';

update how_it_works_content
set translations = jsonb_set(
  translations,
  '{fr,steps}',
  '[
    {"title": "Choisissez vos services", "text": "Annonce, photos, documentation, évaluation : vous ne sélectionnez que ce dont vous avez vraiment besoin."},
    {"title": "Suivez le total en temps réel", "text": "Aucun forfait fixe : votre devis se met à jour à chaque choix, en francs suisses."},
    {"title": "Un accompagnement jusqu''à la vente", "text": "Chaque service acheté est pris en charge, avec des mises à jour à chaque étape."}
  ]'::jsonb,
  true
)
where id = 1 and translations ? 'fr';
