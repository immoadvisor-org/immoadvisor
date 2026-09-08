-- Separa lo stato di pagamento (gestito dal sistema via Stripe: checkout e
-- rimborsi) dallo stato di lavorazione (gestito manualmente dall'admin), e
-- rimuove lo stato per singolo servizio introdotto in 006 (troppo
-- granulare, causava confusione: ora si gestisce solo a livello ordine).

create type public.order_payment_status as enum (
    'pending', 'paid', 'cancelled', 'refund_pending', 'refunded'
);
create type public.order_fulfillment_status as enum ('pending', 'processing', 'completed');

alter table public.orders add column payment_status public.order_payment_status;
alter table public.orders add column fulfillment_status public.order_fulfillment_status not null default 'pending';
alter table public.orders add column stripe_refund_id text;

-- Il vecchio "status" univo mischiava pagamento e lavorazione: 'processing'
-- e 'completed' implicano che l'ordine fosse già stato pagato.
update public.orders set
    payment_status = case status::text
        when 'processing' then 'paid'
        when 'completed' then 'paid'
        else status::text
    end::order_payment_status,
    fulfillment_status = case status::text
        when 'processing' then 'processing'
        when 'completed' then 'completed'
        else 'pending'
    end::order_fulfillment_status;

alter table public.orders alter column payment_status set not null;
alter table public.orders drop column status;
drop type public.order_status;

alter table public.order_items drop column status;
drop type public.order_item_status;
