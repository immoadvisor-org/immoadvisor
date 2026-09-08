-- Aggiunge: email del cliente salvata sull'ordine (per l'elenco ordini in
-- admin, senza dover interrogare lo schema auth), e una tabella unica per
-- le liste di email di notifica (contatti e ordini), al posto del singolo
-- indirizzo di contact_settings.

alter table public.orders add column if not exists email text;

-- Backfill una tantum per gli ordini già esistenti.
update public.orders o
set email = u.email
from auth.users u
where o.user_id = u.id and o.email is null;

create table public.notification_recipients (
    id uuid primary key default gen_random_uuid(),
    purpose text not null check (purpose in ('contact', 'order')),
    email text not null,
    created_at timestamptz not null default now(),
    unique (purpose, email)
);

alter table public.notification_recipients enable row level security;
-- Nessuna policy pubblica: solo il backend (proprietario delle tabelle) vi accede.

-- Migra l'eventuale indirizzo già configurato in contact_settings, poi
-- rimuove la tabella (sostituita da notification_recipients).
insert into public.notification_recipients (purpose, email)
select 'contact', notification_email
from public.contact_settings
where notification_email is not null and notification_email <> ''
on conflict do nothing;

drop table public.contact_settings;
