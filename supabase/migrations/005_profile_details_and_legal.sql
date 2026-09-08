-- Dati anagrafici estesi sul profilo, contenuto legale (termini/privacy)
-- modificabile dall'admin, e orders.user_id reso "nullable" per poter
-- eliminare un account senza perdere lo storico ordini (obblighi
-- contabili/fiscali) — l'email resta comunque nello snapshot già presente.

alter table public.profiles drop column if exists full_name;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists address_line text;
alter table public.profiles add column if not exists postal_code text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists canton text;
alter table public.profiles add column if not exists avs_number text;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;

create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (
        id, first_name, last_name, phone, address_line, postal_code, city,
        canton, avs_number, terms_accepted_at
    )
    values (
        new.id,
        new.raw_user_meta_data ->> 'first_name',
        new.raw_user_meta_data ->> 'last_name',
        new.raw_user_meta_data ->> 'phone',
        new.raw_user_meta_data ->> 'address_line',
        new.raw_user_meta_data ->> 'postal_code',
        new.raw_user_meta_data ->> 'city',
        new.raw_user_meta_data ->> 'canton',
        new.raw_user_meta_data ->> 'avs_number',
        now()
    );
    return new;
end;
$$ language plpgsql security definer;

alter table public.orders drop constraint orders_user_id_fkey;
alter table public.orders alter column user_id drop not null;
alter table public.orders
    add constraint orders_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete set null;

-- Contenuto legale (termini di utilizzo + informativa privacy), stesso
-- pattern di about_content: riga singola con traduzioni per lingua.
create table public.legal_content (
    id integer primary key default 1,
    translations jsonb not null default '{}'::jsonb,
    constraint legal_content_singleton check (id = 1)
);

alter table public.legal_content enable row level security;

create policy "Chiunque legge il contenuto legale"
    on public.legal_content for select
    using (true);

create policy "Admin gestisce il contenuto legale"
    on public.legal_content for all
    using (public.is_admin())
    with check (public.is_admin());

insert into public.legal_content (id, translations) values (1, $json$
{
  "it": {
    "content": "Utilizzando ImmoAdvisor e creando un account, accetti i termini di utilizzo e l'informativa sulla protezione dei dati qui di seguito, redatta in conformità alla Legge federale sulla protezione dei dati (LPD).\n\n1. Titolare del trattamento\nImmoAdvisor gestisce la piattaforma tramite cui puoi configurare e acquistare servizi per la vendita del tuo immobile in Svizzera. Per domande relative ai tuoi dati personali, contattaci tramite la pagina \"Contattaci\".\n\n2. Dati raccolti\nRaccogliamo i dati forniti in fase di registrazione (nome, cognome, email, telefono, indirizzo) e quelli generati dall'utilizzo del servizio (servizi acquistati, ordini, messaggi inviati).\n\n3. Finalità del trattamento\nI dati sono utilizzati per gestire il tuo account, elaborare ordini e pagamenti, fornire i servizi richiesti, rispondere alle tue richieste e adempiere agli obblighi legali, inclusi quelli contabili e fiscali.\n\n4. Conservazione dei dati\nI dati relativi agli ordini sono conservati per il periodo richiesto dalla normativa svizzera in materia contabile e fiscale, anche dopo l'eventuale cancellazione dell'account.\n\n5. Comunicazione a terzi\nI tuoi dati possono essere comunicati a fornitori di servizi terzi strettamente necessari all'erogazione del servizio (es. elaborazione dei pagamenti, invio di email), che agiscono come responsabili del trattamento.\n\n6. I tuoi diritti\nHai diritto di accedere ai tuoi dati, richiederne la rettifica o la cancellazione, e opporti al trattamento, nei limiti previsti dalla legge. Puoi eliminare autonomamente il tuo account in qualsiasi momento dalla pagina del tuo profilo.\n\n7. Modifiche\nCi riserviamo il diritto di modificare questa informativa; le modifiche sostanziali ti verranno comunicate."
  },
  "en": {
    "content": "By using ImmoAdvisor and creating an account, you accept the following terms of use and data protection notice, drafted in accordance with the Swiss Federal Act on Data Protection (FADP).\n\n1. Data controller\nImmoAdvisor operates the platform through which you can configure and purchase services for selling your property in Switzerland. For questions about your personal data, contact us via the \"Contact\" page.\n\n2. Data collected\nWe collect the data you provide when registering (first name, last name, email, phone, address) and the data generated by using the service (purchased services, orders, messages sent).\n\n3. Purpose of processing\nYour data is used to manage your account, process orders and payments, provide the requested services, respond to your requests, and comply with legal obligations, including accounting and tax obligations.\n\n4. Data retention\nOrder-related data is retained for the period required by Swiss accounting and tax regulations, even after your account is deleted.\n\n5. Disclosure to third parties\nYour data may be shared with third-party service providers strictly necessary to deliver the service (e.g. payment processing, sending emails), who act as data processors.\n\n6. Your rights\nYou have the right to access your data, request its correction or deletion, and object to its processing, within the limits provided by law. You can delete your account at any time from your profile page.\n\n7. Changes\nWe reserve the right to modify this notice; substantial changes will be communicated to you."
  },
  "de": {
    "content": "Mit der Nutzung von ImmoAdvisor und der Erstellung eines Kontos akzeptieren Sie die folgenden Nutzungsbedingungen und den Datenschutzhinweis, verfasst in Übereinstimmung mit dem Schweizer Bundesgesetz über den Datenschutz (DSG).\n\n1. Verantwortliche Stelle\nImmoAdvisor betreibt die Plattform, über die Sie Dienstleistungen für den Verkauf Ihrer Immobilie in der Schweiz konfigurieren und erwerben können. Bei Fragen zu Ihren personenbezogenen Daten kontaktieren Sie uns über die Seite \"Kontakt\".\n\n2. Erhobene Daten\nWir erheben die bei der Registrierung angegebenen Daten (Vorname, Nachname, E-Mail, Telefon, Adresse) sowie die durch die Nutzung des Dienstes generierten Daten (gekaufte Dienstleistungen, Bestellungen, gesendete Nachrichten).\n\n3. Zweck der Verarbeitung\nIhre Daten werden verwendet, um Ihr Konto zu verwalten, Bestellungen und Zahlungen abzuwickeln, die angeforderten Dienstleistungen zu erbringen, auf Ihre Anfragen zu antworten und gesetzliche Pflichten zu erfüllen, einschliesslich buchhalterischer und steuerlicher Pflichten.\n\n4. Aufbewahrung der Daten\nBestellungsbezogene Daten werden für den nach Schweizer Buchhaltungs- und Steuerrecht erforderlichen Zeitraum aufbewahrt, auch nach einer eventuellen Löschung des Kontos.\n\n5. Weitergabe an Dritte\nIhre Daten können an Drittanbieter weitergegeben werden, die für die Erbringung des Dienstes unbedingt erforderlich sind (z. B. Zahlungsabwicklung, Versand von E-Mails) und als Auftragsverarbeiter handeln.\n\n6. Ihre Rechte\nSie haben das Recht, auf Ihre Daten zuzugreifen, deren Berichtigung oder Löschung zu verlangen und der Verarbeitung im gesetzlich vorgesehenen Rahmen zu widersprechen. Sie können Ihr Konto jederzeit über Ihre Profilseite selbst löschen.\n\n7. Änderungen\nWir behalten uns das Recht vor, diesen Hinweis zu ändern; wesentliche Änderungen werden Ihnen mitgeteilt."
  },
  "fr": {
    "content": "En utilisant ImmoAdvisor et en créant un compte, vous acceptez les conditions d'utilisation et la déclaration de protection des données suivantes, rédigées conformément à la Loi fédérale sur la protection des données (LPD).\n\n1. Responsable du traitement\nImmoAdvisor exploite la plateforme qui vous permet de configurer et d'acheter des services pour la vente de votre bien en Suisse. Pour toute question relative à vos données personnelles, contactez-nous via la page \"Contact\".\n\n2. Données collectées\nNous collectons les données que vous fournissez lors de l'inscription (prénom, nom, e-mail, téléphone, adresse) ainsi que les données générées par l'utilisation du service (services achetés, commandes, messages envoyés).\n\n3. Finalité du traitement\nVos données sont utilisées pour gérer votre compte, traiter les commandes et les paiements, fournir les services demandés, répondre à vos demandes et respecter les obligations légales, y compris comptables et fiscales.\n\n4. Conservation des données\nLes données relatives aux commandes sont conservées pendant la durée requise par la réglementation suisse en matière comptable et fiscale, même après la suppression éventuelle du compte.\n\n5. Communication à des tiers\nVos données peuvent être communiquées à des prestataires tiers strictement nécessaires à la fourniture du service (p. ex. traitement des paiements, envoi d'e-mails), agissant en tant que sous-traitants.\n\n6. Vos droits\nVous avez le droit d'accéder à vos données, d'en demander la rectification ou la suppression, et de vous opposer à leur traitement, dans les limites prévues par la loi. Vous pouvez supprimer votre compte à tout moment depuis la page de votre profil.\n\n7. Modifications\nNous nous réservons le droit de modifier la présente déclaration ; les modifications substantielles vous seront communiquées."
  }
}
$json$::jsonb);
