-- Aggiunge: colonna image_urls su services (era stata applicata a mano,
-- qui la tracciamo per rendere riproducibile un ambiente nuovo), e le
-- tabelle per il modulo "Contattaci".

-- ============================================================
-- services.image_urls: URL pubblici delle foto caricate su Supabase
-- Storage (bucket "service-images"), in ordine di visualizzazione.
-- ============================================================
alter table public.services
    add column if not exists image_urls jsonb not null default '[]'::jsonb;

-- ============================================================
-- contact_messages: messaggi inviati dal form "Contattaci"
-- ============================================================
create table public.contact_messages (
    id uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    email text not null,
    phone text,
    message text not null,
    created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
-- Nessuna policy per anon/authenticated: solo il backend (che si connette
-- come proprietario delle tabelle e quindi bypassa la RLS) può leggere o
-- scrivere qui, esattamente come per orders/order_items.

create index idx_contact_messages_created_at on public.contact_messages (created_at desc);

-- ============================================================
-- contact_settings: riga singola con l'indirizzo email a cui inviare
-- la notifica quando arriva un nuovo messaggio di contatto.
-- ============================================================
create table public.contact_settings (
    id integer primary key default 1,
    notification_email text,
    constraint contact_settings_singleton check (id = 1)
);

alter table public.contact_settings enable row level security;
-- Anche qui nessuna policy: gestita solo dal backend (endpoint admin).

insert into public.contact_settings (id, notification_email) values (1, null);
