-- Contenuto della sezione "Come funziona" in home page, gestibile
-- dall'admin (stesso pattern di about_content).

create table public.how_it_works_content (
    id integer primary key default 1,
    translations jsonb not null default '{}'::jsonb,
    constraint how_it_works_content_singleton check (id = 1)
);

alter table public.how_it_works_content enable row level security;

create policy "Chiunque legge il contenuto di Come funziona"
    on public.how_it_works_content for select
    using (true);

create policy "Admin gestisce il contenuto di Come funziona"
    on public.how_it_works_content for all
    using (public.is_admin())
    with check (public.is_admin());

insert into public.how_it_works_content (id, translations) values (1, $json$
{
  "it": {
    "title": "Come funziona",
    "text": "Sfoglia i servizi disponibili — annuncio, fotografie, documentazione, valutazione e altro — seleziona quelli che ti servono e vedi il totale aggiornarsi in tempo reale. Nessun pacchetto fisso: costruisci il tuo su misura."
  },
  "en": {
    "title": "How it works",
    "text": "Browse the available services — listing, photography, documentation, valuation and more — select the ones you need and watch the total update in real time. No fixed bundles: build your own."
  },
  "de": {
    "title": "So funktioniert's",
    "text": "Durchstöbern Sie die verfügbaren Dienstleistungen — Inserat, Fotografie, Unterlagen, Bewertung und mehr — wählen Sie die gewünschten aus und sehen Sie die Summe in Echtzeit aktualisiert. Keine festen Pakete: stellen Sie Ihr eigenes zusammen."
  },
  "fr": {
    "title": "Comment ça marche",
    "text": "Parcourez les services disponibles — annonce, photographie, documentation, évaluation et plus encore — sélectionnez ceux dont vous avez besoin et regardez le total se mettre à jour en temps réel. Pas de forfaits fixes : composez le vôtre."
  }
}
$json$::jsonb);
