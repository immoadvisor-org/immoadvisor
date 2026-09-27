-- Testi delle email inviate dal sito (notifiche admin, aggiornamenti al
-- cliente) e firma, modificabili dall'admin. I testi predefiniti vivono nel
-- codice del backend: qui si salvano solo quelli personalizzati, e
-- cancellare una riga ripristina il testo predefinito.

create table public.email_templates (
    key text primary key,
    subject text,
    body text not null,
    -- Usato solo dalla firma (key = 'signature'): mostra il logo sopra il testo.
    show_logo boolean not null default true,
    updated_at timestamptz not null default now()
);

alter table public.email_templates enable row level security;
-- Nessuna policy pubblica: letta e scritta solo dal backend (che bypassa RLS).
