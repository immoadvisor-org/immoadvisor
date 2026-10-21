-- Rebranding: ImmoAdvisor diventa HomeBlock. Aggiorna i testi già salvati
-- nel database (Chi siamo, termini e condizioni, email personalizzate).

update public.about_content
set translations = replace(translations::text, 'ImmoAdvisor', 'HomeBlock')::jsonb;

update public.legal_content
set translations = replace(translations::text, 'ImmoAdvisor', 'HomeBlock')::jsonb;

update public.email_templates
set subject = replace(subject, 'ImmoAdvisor', 'HomeBlock'),
    body = replace(body, 'ImmoAdvisor', 'HomeBlock');
