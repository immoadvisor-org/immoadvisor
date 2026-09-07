# Backend — FastAPI

Logica di business del progetto: catalogo servizi, ordini, checkout Stripe, webhook, orchestrazione post-pagamento (ImmoScout24, documentazione).

## Struttura

```
app/
├── main.py                    Entry point, crea l'app FastAPI e monta i router
├── core/
│   ├── config.py              Configurazione da variabili d'ambiente
│   └── security.py            Verifica dei JWT emessi da Supabase Auth
├── db/
│   ├── base.py                Base declarativa SQLAlchemy
│   └── session.py             Engine e sessione DB
├── models/                    Modelli SQLAlchemy (mappano le tabelle Supabase)
├── schemas/                   Modelli Pydantic per request/response delle API
├── services/                  Logica di business (order_service, stripe_service, ...)
├── integrations/              Client verso servizi esterni (Stripe, ImmoScout24)
└── api/v1/
    ├── router.py               Aggrega tutti i router
    └── endpoints/              Un file per risorsa (services, orders, checkout, webhooks)
```

Ogni livello dipende solo da quello sottostante: gli endpoint chiamano i `services`, i `services` usano `models`/`integrations`, mai il contrario.

## Avvio locale

```bash
python -m venv .venv
source .venv/bin/activate  # su Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env  # poi compila le variabili
uvicorn app.main:app --reload
```

API disponibile su `http://localhost:8000`, documentazione automatica su `http://localhost:8000/docs`.

## Test

```bash
pytest
```

## Docker

```bash
docker build -t immo-backend .
docker run --env-file .env -p 8000:8000 immo-backend
```
