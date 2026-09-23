-- Permette di nascondere, pacchetto per pacchetto, l'opzione di pagamento
-- in un'unica soluzione: quando false, il cliente vede solo il rateale
-- (nessun selettore) e il backend rifiuta comunque una richiesta di
-- checkout "single" per quel pacchetto, anche se qualcuno la forzasse
-- manualmente lato client.
alter table public.sales_packages
    add column allow_single_payment boolean not null default true;
