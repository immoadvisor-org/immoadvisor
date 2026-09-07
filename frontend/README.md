# Frontend — Next.js

Configuratore di servizi, carrello, checkout e area utente.

## Struttura

```
src/
├── app/[locale]/        Route (App Router), prefissate dalla lingua: home, cart, account, login, admin
├── components/          Componenti divisi per dominio: layout, configurator, cart, admin, ui
├── features/            Logica applicativa non legata al rendering
│   ├── cart/            Store dello stato del carrello (Zustand)
│   ├── services/        Fetch e tipi del catalogo servizi (per lingua)
│   ├── auth/             Client Supabase e hook di autenticazione
│   ├── profile/          Hook per verificare se l'utente è admin
│   ├── admin/            Client API per la gestione del catalogo
│   └── checkout/         Chiamata al backend per avviare il pagamento Stripe
├── i18n/                 Configurazione next-intl (routing, navigazione localizzata, caricamento messaggi)
├── middleware.ts         Redirect/prefisso lingua automatico
├── lib/                  Utility condivise (client HTTP verso il backend)
└── types/                Tipi TypeScript condivisi

messages/                 Stringhe di interfaccia per lingua: en.json, it.json, de.json, fr.json
```

## Avvio locale

```bash
npm install
cp .env.local.example .env.local  # poi compila le variabili
npm run dev
```

Disponibile su `http://localhost:3000`. Richiede il backend FastAPI in esecuzione su `NEXT_PUBLIC_API_BASE_URL`.
