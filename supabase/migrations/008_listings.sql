-- Modulo "Annunci": inserzioni immobiliari (separate dai "servizi" acquistabili),
-- mostrate in home page e in una sezione dedicata con ricerca.

create table public.listings (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    city text not null,
    canton text,
    price_chf numeric(12, 2) not null check (price_chf >= 0),
    -- Numero di locali secondo la convenzione svizzera (es. 4.5), non m².
    rooms numeric(3, 1) not null check (rooms > 0),
    active boolean not null default true,
    display_order integer not null default 0,
    -- { "it": {"title":..., "short_description":..., "full_description":...}, "en": {...}, ... }
    translations jsonb not null default '{}'::jsonb,
    image_urls jsonb not null default '[]'::jsonb,
    video_url text,
    created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Chiunque legge gli annunci attivi"
    on public.listings for select
    using (active = true);

create policy "Admin gestisce gli annunci"
    on public.listings for all
    using (public.is_admin())
    with check (public.is_admin());

create index idx_listings_display_order on public.listings (display_order);
create index idx_listings_city on public.listings (city);
create index idx_listings_price on public.listings (price_chf);
create index idx_listings_rooms on public.listings (rooms);
