-- Ordine e visibilità delle sezioni "a blocco" della home page, gestibili
-- dall'admin: un singleton con un array ordinato di { key, visible }.
-- Sostituisce l'approccio precedente (024_how_it_works_visibility.sql,
-- 023_how_it_works_visibility.sql, ora inutilizzata): un'unica pagina
-- admin gestisce ordine e visibilità di tutte le sezioni riordinabili,
-- invece di un controllo sparso per ogni singola sezione.
-- Hero e la sezione di contatto finale restano fisse (prima e ultima):
-- non fanno parte di questo elenco.
create table public.home_layout (
    id integer primary key default 1,
    sections jsonb not null default '[]'::jsonb,
    constraint home_layout_singleton check (id = 1)
);

alter table public.home_layout enable row level security;

create policy "Chiunque legge il layout della home"
    on public.home_layout for select
    using (true);

create policy "Admin gestisce il layout della home"
    on public.home_layout for all
    using (public.is_admin())
    with check (public.is_admin());

insert into public.home_layout (id, sections) values (1, $json$
[
  {"key": "packages", "visible": true},
  {"key": "services", "visible": true},
  {"key": "about", "visible": true},
  {"key": "listings", "visible": true},
  {"key": "how_it_works", "visible": true}
]
$json$::jsonb);
