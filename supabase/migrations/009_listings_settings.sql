-- Interruttore generale per la sezione "Annunci": se disattivato, non
-- compare né nel menu né in home, indipendentemente dagli annunci attivi.

create table public.listings_settings (
    id integer primary key default 1,
    enabled boolean not null default true,
    constraint listings_settings_singleton check (id = 1)
);

alter table public.listings_settings enable row level security;
-- Nessuna policy pubblica: il valore viene esposto tramite l'endpoint
-- pubblico /listings/settings gestito dal backend (che bypassa RLS).

insert into public.listings_settings (id, enabled) values (1, true);
