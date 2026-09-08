-- Permette di collegare (come semplice riferimento testuale, non FK: il
-- messaggio deve restare leggibile anche se l'annuncio viene poi rimosso)
-- un messaggio di contatto a uno specifico annuncio, per le richieste di
-- informazioni inviate dalla pagina di dettaglio annuncio.

alter table public.contact_messages add column listing_reference text;
