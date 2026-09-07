-- Schema iniziale: catalogo servizi (multilingua), profili utente, ordini.
-- Da eseguire nel SQL editor di Supabase (o via supabase CLI: supabase db push).

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles: dati aggiuntivi collegati a auth.users
-- ============================================================
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    phone text,
    is_admin boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Un utente legge il proprio profilo"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Un utente aggiorna il proprio profilo"
    on public.profiles for update
    using (auth.uid() = id);

-- Crea automaticamente il profilo alla registrazione
create function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data ->> 'full_name');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Helper usato dalle policy per verificare se l'utente corrente è admin.
-- security definer per poter leggere profiles anche quando il chiamante
-- non avrebbe altrimenti visibilità sulla riga altrui.
create function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ============================================================
-- services: voci di catalogo acquistabili, gestite dall'admin.
-- Nome e descrizione sono multilingua: "translations" è un oggetto
-- { "it": {"name": ..., "description": ...}, "en": {...}, "de": {...}, "fr": {...} }.
-- display_order controlla l'ordine di visualizzazione nel configuratore.
-- ============================================================
create table public.services (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    category text not null default 'generico',
    price_chf numeric(10, 2) not null check (price_chf >= 0),
    active boolean not null default true,
    display_order integer not null default 0,
    translations jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Chiunque legge i servizi attivi"
    on public.services for select
    using (active = true);

create policy "Admin gestisce il catalogo"
    on public.services for all
    using (public.is_admin())
    with check (public.is_admin());

create index idx_services_display_order on public.services (display_order);

-- ============================================================
-- orders / order_items
-- ============================================================
create type public.order_status as enum (
    'pending', 'paid', 'processing', 'completed', 'cancelled'
);

create table public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles (id) on delete cascade,
    status public.order_status not null default 'pending',
    total_chf numeric(10, 2) not null check (total_chf >= 0),
    stripe_session_id text,
    stripe_payment_intent text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Un utente legge i propri ordini"
    on public.orders for select
    using (auth.uid() = user_id);

-- Insert/update sugli ordini avvengono solo dal backend con la service role
-- key (che bypassa RLS), per garantire che stato e totale non siano
-- manipolabili dal client.

create table public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders (id) on delete cascade,
    service_id uuid not null references public.services (id),
    service_name_snapshot text not null,
    price_chf_snapshot numeric(10, 2) not null,
    created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Un utente legge le righe dei propri ordini"
    on public.order_items for select
    using (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        )
    );

create index idx_orders_user_id on public.orders (user_id);
create index idx_order_items_order_id on public.order_items (order_id);

-- ============================================================
-- Dati di esempio (rimuovere o modificare in produzione)
-- ============================================================
insert into public.services (slug, category, price_chf, display_order, translations) values
('annuncio-immoscout', 'marketing', 350.00, 10, $json$
{
  "it": {"name": "Pubblicazione annuncio su ImmoScout24", "description": "Creazione e pubblicazione dell'annuncio sul principale portale immobiliare svizzero."},
  "en": {"name": "ImmoScout24 listing publication", "description": "Creation and publication of your listing on Switzerland's leading real estate portal."},
  "de": {"name": "Inserat-Veröffentlichung auf ImmoScout24", "description": "Erstellung und Veröffentlichung Ihres Inserats auf dem führenden Schweizer Immobilienportal."},
  "fr": {"name": "Publication de l'annonce sur ImmoScout24", "description": "Création et publication de votre annonce sur le principal portail immobilier suisse."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('servizio-fotografico', 'media', 280.00, 20, $json$
{
  "it": {"name": "Servizio fotografico professionale", "description": "Shooting fotografico dell'immobile con fotografo professionista."},
  "en": {"name": "Professional photography service", "description": "Photo shoot of the property with a professional photographer."},
  "de": {"name": "Professioneller Fotoservice", "description": "Fotoshooting der Immobilie mit einem professionellen Fotografen."},
  "fr": {"name": "Service de photographie professionnelle", "description": "Séance photo du bien avec un photographe professionnel."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('documentazione-vendita', 'legale', 450.00, 30, $json$
{
  "it": {"name": "Documentazione per la vendita", "description": "Preparazione della documentazione legale e tecnica necessaria per la vendita in Svizzera."},
  "en": {"name": "Sale documentation", "description": "Preparation of the legal and technical documentation required to sell property in Switzerland."},
  "de": {"name": "Verkaufsdokumentation", "description": "Erstellung der für den Immobilienverkauf in der Schweiz erforderlichen rechtlichen und technischen Unterlagen."},
  "fr": {"name": "Documentation de vente", "description": "Préparation de la documentation juridique et technique nécessaire à la vente en Suisse."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('planimetria-3d', 'media', 390.00, 40, $json$
{
  "it": {"name": "Planimetria e tour virtuale 3D", "description": "Rilievo e realizzazione di planimetria interattiva e tour virtuale 3D."},
  "en": {"name": "3D floor plan and virtual tour", "description": "Survey and creation of an interactive floor plan and 3D virtual tour."},
  "de": {"name": "3D-Grundriss und virtuelle Besichtigung", "description": "Vermessung und Erstellung eines interaktiven Grundrisses sowie einer virtuellen 3D-Besichtigung."},
  "fr": {"name": "Plan 3D et visite virtuelle", "description": "Relevé et création d'un plan interactif et d'une visite virtuelle 3D."}
}
$json$::jsonb);

insert into public.services (slug, category, price_chf, display_order, translations) values
('valutazione-immobile', 'consulenza', 220.00, 50, $json$
{
  "it": {"name": "Valutazione professionale dell'immobile", "description": "Perizia di valutazione del valore di mercato realizzata da un esperto."},
  "en": {"name": "Professional property valuation", "description": "Market value appraisal carried out by an expert."},
  "de": {"name": "Professionelle Immobilienbewertung", "description": "Verkehrswertgutachten, erstellt von einem Experten."},
  "fr": {"name": "Évaluation professionnelle du bien", "description": "Expertise de la valeur marchande réalisée par un spécialiste."}
}
$json$::jsonb);

-- Per rendere un utente amministratore (dopo che si è registrato una volta):
-- update public.profiles set is_admin = true where id = '<uuid-utente>';
