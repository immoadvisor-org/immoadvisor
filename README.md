# Immo Services Platform

Piattaforma per la vendita di servizi immobiliari (annuncio ImmoScout24, documentazione, fotografie, ecc.) tramite un configuratore stile "car configurator" con carrello e checkout.

## Architettura

```
immo-services-platform/
├── frontend/          Next.js (App Router) + TypeScript + Tailwind — configuratore, carrello, area utente
├── backend/           FastAPI (Python) — API, logica di business, integrazioni (Stripe, ImmoScout24)
└── supabase/          Schema SQL, Row Level Security, migrazioni per Postgres/Auth/Storage
```

Il database, l'autenticazione e lo storage file sono gestiti da **Supabase** (Postgres). Il **backend FastAPI** contiene la logica di business specifica del dominio: calcolo ordini, creazione sessioni di pagamento Stripe, gestione webhook, orchestrazione post-pagamento (pubblicazione annuncio, generazione documenti). Il **frontend Next.js** si autentica direttamente con Supabase e parla con il backend per tutto ciò che riguarda ordini e pagamenti.

Vedi lo schema architetturale discusso in chat per il flusso completo Utente → Frontend → Backend → Stripe → ImmoScout24.

## Catalogo e amministrazione

Le voci di catalogo (i servizi acquistabili) vivono nella tabella `services`: hanno uno slug, categoria, prezzo, un flag `active` (visibile o nascosto) e un `display_order` (ordine di visualizzazione). Nome e descrizione sono multilingua, salvati nel campo `translations` come JSON per lingua.

Un utente con `profiles.is_admin = true` può gestire il catalogo da `/admin/services` (creare, modificare, nascondere, riordinare, eliminare le voci) tramite le API protette in `backend/app/api/v1/endpoints/admin_services.py`. Per rendere amministratore il primo utente, dopo la sua registrazione:

```sql
update public.profiles set is_admin = true where id = '<uuid-utente>';
```

## Lingue

Il sito è disponibile in italiano (lingua di default), inglese, tedesco e francese. Il routing con prefisso lingua (`/it`, `/en`, `/de`, `/fr`) è gestito da `next-intl` (vedi `frontend/src/i18n/` e `frontend/src/middleware.ts`); le stringhe dell'interfaccia sono in `frontend/messages/*.json`, mentre nome e descrizione dei servizi sono tradotti nel database.

## Setup rapido

1. **Supabase**: crea un progetto su [supabase.com](https://supabase.com), esegui le migrazioni in `supabase/migrations/` dal SQL editor, copia URL e chiavi.
2. **Backend**: vedi [backend/README.md](backend/README.md)
3. **Frontend**: vedi [frontend/README.md](frontend/README.md)

Guida passo-passo con lo stato di avanzamento (account Supabase/Stripe, tabella di corrispondenza delle variabili, primo test): [SETUP.md](SETUP.md).

## Stack

| Livello | Tecnologia |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand, next-intl |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database / Auth / Storage | Supabase (Postgres) |
| Pagamenti | Stripe (carta, TWINT, Google Pay, PayPal) |
| Hosting consigliato | Vercel (frontend), Railway/Fly.io/VPS Docker (backend) |
