# Setup del progetto — guida e stato

Riepilogo di tutti i passaggi per collegare Supabase e Stripe e avviare il progetto in locale. Aggiorna le caselle man mano che procedi, così se la chat si allunga resta comunque chiaro dove siamo arrivati.

## 1. Supabase

- [x] Creato account Supabase (email + password, GitHub non è obbligatorio)
- [x] Creato progetto (`shopHouseServicesProject`)
- [x] Eseguita la migration [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql) dal SQL Editor — crea tabelle, sicurezza (RLS) e i 5 servizi di esempio
- [ ] Verificato il contenuto della tabella `services` (Table Editor, o query `select * from public.services`)

Per recuperare le chiavi: pulsante verde **Connect** in alto nel progetto → sezione **"Set environment variables"**. Dà già le variabili pronte con questi nomi:

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`

> Nota: questo progetto Supabase usa il **nuovo sistema di chiavi** (Publishable/Secret + JWKS a firma asimmetrica), non il vecchio anon/service_role + JWT secret condiviso. Il codice è già aggiornato di conseguenza.

Per la stringa di connessione al database: stesso pulsante **Connect** → tab **Connection string**. Usa la variante **Session pooler** (compatibile IPv4, consigliata per un backend "normale" come il nostro) invece di **Direct connection** (richiede IPv6, spesso causa timeout).

### Tabella di corrispondenza — Backend (`backend/.env`)

| Variabile in `.env` | Valore da Supabase / Stripe | Stato |
|---|---|---|
| `DATABASE_URL` | Connect → Connection string → **Session pooler** (aggiungi `+psycopg2` dopo `postgresql`) | ⬜ da compilare |
| `SUPABASE_URL` | Connect → `SUPABASE_URL` | ✅ compilato |
| `SUPABASE_SECRET_KEY` | Connect → `SUPABASE_SECRET_KEY` | ✅ compilato |
| `SUPABASE_JWKS_URL` | Connect → `SUPABASE_JWKS_URL` | ✅ compilato |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys (modalità **test**, `sk_test_...`) | ⬜ da compilare |
| `STRIPE_WEBHOOK_SECRET` | Output del comando `stripe listen` (vedi sotto) | ⬜ da compilare |
| `FRONTEND_URL` | `http://localhost:3000` | ✅ già ok così |
| `IMMOSCOUT_API_KEY` / `IMMOSCOUT_API_BASE_URL` | lascia vuoto, nessuna credenziale partner ancora | ✅ già ok così |

### Tabella di corrispondenza — Frontend (`frontend/.env.local`)

| Variabile in `.env.local` | Valore da Supabase | Stato |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Connect → `SUPABASE_URL` (stesso valore del backend) | ✅ compilato |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Connect → `SUPABASE_PUBLISHABLE_KEY` | ✅ compilato |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | ✅ già ok così |

Il frontend **non** usa `SUPABASE_JWKS_URL` né `SUPABASE_SECRET_KEY`: quelle servono solo al backend per verificare i token e per operazioni con privilegi elevati. Il frontend si autentica con `supabase-js` usando solo URL + publishable key.

## 2. Stripe (modalità test)

- [ ] Creato account su [stripe.com](https://stripe.com)
- [ ] Verificato di essere in **modalità test** (interruttore in alto nella dashboard)
- [ ] Copiata la Secret key di test da Developers → API keys → `STRIPE_SECRET_KEY` in `backend/.env`
- [ ] Installata la [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [ ] Eseguito `stripe login`
- [ ] Avviato, in un terminale dedicato tenuto sempre aperto durante i test:
  ```bash
  stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
  ```
  Il comando stampa un `whsec_...`: copialo in `STRIPE_WEBHOOK_SECRET`. Senza questo comando attivo, il backend non riceve mai la conferma di pagamento e gli ordini restano "in attesa".

## 3. Avvio del progetto

Dipendenze già installate in entrambi i progetti.

```bash
cd immo-services-platform/backend && .venv/Scripts/activate && uvicorn app.main:app --reload
```
```bash
cd immo-services-platform/frontend && npm run dev
```

## 4. Primo test end-to-end

- [ ] Vai su `localhost:3000`, registrati da **Accedi**
- [ ] Rendi il tuo utente admin nel SQL Editor di Supabase (trovi l'uuid in Authentication → Users):
  ```sql
  update public.profiles set is_admin = true where id = '<tuo-uuid>';
  ```
- [ ] Aggiungi qualche servizio al carrello, vai al checkout
- [ ] Paga con la carta di test `4242 4242 4242 4242`, data futura qualsiasi, CVC qualsiasi
- [ ] Con `stripe listen` attivo, verifica che l'ordine passi a "Pagato" in **I miei acquisti**
- [ ] Da `/admin/services` prova a modificare/nascondere/riordinare una voce di catalogo

## Riferimenti rapidi

- Schema del catalogo, admin e multilingua: vedi [README.md](README.md)
- Setup dettagliato backend: [backend/README.md](backend/README.md)
- Setup dettagliato frontend: [frontend/README.md](frontend/README.md)
