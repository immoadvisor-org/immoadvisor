-- Traccia il pagamento rateale (abbonamento Stripe a N cicli fissi) sugli
-- ordini: modalità scelta dal cliente, quante rate totali e quante già
-- incassate (per la vista admin), e gli identificativi Stripe necessari
-- per riconciliare i webhook (sottoscrizione, piano a cicli fissi, ultima
-- fattura elaborata — quest'ultima serve solo per idempotenza sui webhook,
-- evitando di contare due volte la stessa rata se Stripe ripete la
-- consegna dell'evento).
alter table public.orders
    add column payment_mode text not null default 'single'
        check (payment_mode in ('single', 'installments')),
    add column installments_total integer check (installments_total is null or installments_total >= 1),
    add column installments_paid integer not null default 0 check (installments_paid >= 0),
    add column stripe_subscription_id text,
    add column stripe_subscription_schedule_id text,
    add column stripe_last_invoice_id text;

create index idx_orders_stripe_subscription_id on public.orders (stripe_subscription_id);
