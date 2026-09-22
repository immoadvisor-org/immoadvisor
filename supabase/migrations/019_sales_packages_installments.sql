-- Numero di rate mensili proposto per il pagamento rateale di un pacchetto
-- (es. Basic/Medium/All Inclusive = 4, come da mandato tipico del PDF).
-- Configurabile dall'admin per ogni pacchetto, non fisso a livello di codice.
alter table public.sales_packages
    add column installments integer not null default 4 check (installments >= 1);
