-- Permette a un ordine di contenere una riga per un pacchetto di vendita
-- (public.sales_packages), non solo per un servizio a la carte
-- (public.services): un cliente può ora acquistare direttamente un
-- pacchetto Basic/Medium/All Inclusive con lo stesso checkout Stripe già
-- usato per i servizi (pagamento singolo).
-- Ogni riga d'ordine referenzia esattamente uno dei due (mai entrambi, mai
-- nessuno): il vincolo sotto lo garantisce a livello di database.

alter table public.order_items
    alter column service_id drop not null;

alter table public.order_items
    add column package_id uuid references public.sales_packages (id);

alter table public.order_items
    add constraint order_items_exactly_one_item_ref
    check ((service_id is not null) <> (package_id is not null));

create index idx_order_items_package_id on public.order_items (package_id);
