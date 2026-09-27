-- Immagini della pagina "Chi siamo", caricate da Admin → Chi siamo (bucket
-- "content-images"). La foto principale è usata anche nella sezione "Chi
-- siamo" della home; lo sfondo è quello del riquadro finale di contatto.
-- Se vuote, il sito usa le immagini predefinite incluse nel frontend.

alter table public.about_content add column if not exists main_image_url text;
alter table public.about_content add column if not exists cta_image_url text;
