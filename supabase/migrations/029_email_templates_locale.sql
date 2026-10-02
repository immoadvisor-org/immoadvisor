-- Modelli email per lingua: ogni personalizzazione vale per una sola lingua
-- (chiave primaria key + locale). Le righe esistenti erano in italiano.
alter table public.email_templates add column locale text not null default 'it';
alter table public.email_templates drop constraint email_templates_pkey;
alter table public.email_templates add primary key (key, locale);
alter table public.email_templates alter column locale drop default;

-- Lingua in cui il cliente usava il sito, per scrivergli nella stessa lingua.
-- Null per i dati precedenti: si usa la lingua predefinita (italiano).
alter table public.contact_messages add column locale text;
alter table public.orders add column locale text;
