-- Nuovi stati di pagamento per gli ordini a rate (abbonamento Stripe a
-- cicli fissi): "active" mentre le rate vengono addebitate con successo,
-- "past_due" se una rata non va a buon fine (Stripe la ritenta
-- automaticamente), "completed" quando tutte le rate sono state pagate.
-- Ogni ALTER TYPE ... ADD VALUE è una propria istruzione: in PostgreSQL il
-- nuovo valore non è utilizzabile nella stessa transazione in cui viene
-- aggiunto, per questo sta in una migration a sé, eseguita ed eseguita
-- (committata) prima di 021, che lo userà.
alter type public.order_payment_status add value if not exists 'active';
alter type public.order_payment_status add value if not exists 'past_due';
alter type public.order_payment_status add value if not exists 'completed';
