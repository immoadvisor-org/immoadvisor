-- Permette di nascondere l'intera sezione "Come funziona" dalla home page
-- senza doverne cancellare i testi (utile per riattivarla in seguito).
-- Non è per-lingua: se è nascosta, lo è per tutte le lingue.
alter table public.how_it_works_content
    add column visible boolean not null default true;
