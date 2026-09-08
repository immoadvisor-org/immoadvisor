-- Stato di lavorazione per singolo servizio acquistato (order_items), così
-- l'admin può segnare ogni servizio come preso in carico/completato
-- indipendentemente dagli altri servizi dello stesso ordine.

create type public.order_item_status as enum ('pending', 'processing', 'completed');

alter table public.order_items
    add column status public.order_item_status not null default 'pending';
