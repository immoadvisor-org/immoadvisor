-- Stato di gestione dei messaggi di contatto ricevuti (lato admin), con
-- note libere: consente di tracciare il follow-up di ogni richiesta.

create type public.contact_message_status as enum (
    'received', 'contacted', 'to_recontact', 'completed'
);

alter table public.contact_messages
    add column status public.contact_message_status not null default 'received',
    add column notes text;
