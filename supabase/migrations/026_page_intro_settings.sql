-- Interruttori per nascondere il banner introduttivo (hero con titolo e
-- sottotitolo) in cima alle pagine Configuratore e Annunci, lasciando
-- visibile il contenuto sottostante (pacchetti, annunci).

create table public.page_intro_settings (
    id integer primary key default 1,
    show_configurator_intro boolean not null default true,
    show_listings_intro boolean not null default true,
    constraint page_intro_settings_singleton check (id = 1)
);

alter table public.page_intro_settings enable row level security;
-- Nessuna policy pubblica: il valore viene esposto tramite l'endpoint
-- pubblico /page-intro-settings gestito dal backend (che bypassa RLS).

insert into public.page_intro_settings (id, show_configurator_intro, show_listings_intro) values (1, true, true);
