-- Annulla 023_how_it_works_visibility.sql: quella colonna è stata
-- superata da public.home_layout (024_home_layout.sql), che gestisce
-- ordine e visibilità di tutte le sezioni riordinabili della home in un
-- unico posto, invece di un controllo "visible" per singola sezione.
-- "if exists" rende la migration sicura sia che 023 sia stata eseguita
-- sia che sia stata saltata.
alter table public.how_it_works_content
    drop column if exists visible;
