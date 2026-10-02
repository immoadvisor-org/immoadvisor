"""Testi predefiniti delle email, per lingua.

Il testo e' scritto in chiaro: una riga vuota separa i paragrafi, **testo**
diventa grassetto e {segnaposto} viene sostituito con i dati della singola
email. I nomi dei segnaposto restano uguali in tutte le lingue.
"""

from dataclasses import dataclass
from app.schemas.email_template import EmailTemplateGroup
from app.services.i18n import DEFAULT_LOCALE

SIGNATURE_KEY = "signature"

Localized = dict[str, str]


@dataclass(frozen=True)
class TemplateDefinition:
    group: EmailTemplateGroup
    subject: Localized | None
    body: Localized
    placeholders: tuple[str, ...]

    @property
    def locales(self) -> tuple[str, ...]:
        """Lingue in cui il modello si scrive. Le notifiche allo staff
        partono sempre nella lingua predefinita."""
        return (DEFAULT_LOCALE,) if self.group == "admin" else tuple(self.body)


def _brand(titles: Localized) -> Localized:
    return {locale: f"ImmoAdvisor — {title}" for locale, title in titles.items()}


_ORDER_PLACEHOLDERS = ("totale", "rate", "servizi")
_ORDER_DETAILS: Localized = {
    "it": "**Totale:** CHF {totale}\n{rate}\n\n**Servizi:**\n{servizi}",
    "en": "**Total:** CHF {totale}\n{rate}\n\n**Services:**\n{servizi}",
    "de": "**Gesamt:** CHF {totale}\n{rate}\n\n**Leistungen:**\n{servizi}",
    "fr": "**Total :** CHF {totale}\n{rate}\n\n**Services :**\n{servizi}",
}
_SERVICES_ONLY: Localized = {
    "it": "**Servizi:**\n{servizi}",
    "en": "**Services:**\n{servizi}",
    "de": "**Leistungen:**\n{servizi}",
    "fr": "**Services :**\n{servizi}",
}
_YOUR_MESSAGE: Localized = {
    "it": "**Il tuo messaggio:**\n{messaggio}",
    "en": "**Your message:**\n{messaggio}",
    "de": "**Ihre Nachricht:**\n{messaggio}",
    "fr": "**Votre message :**\n{messaggio}",
}


def _with(messages: Localized, details: Localized) -> Localized:
    return {locale: f"{message}\n\n{details[locale]}" for locale, message in messages.items()}


def _customer_payment(titles: Localized, messages: Localized) -> TemplateDefinition:
    return TemplateDefinition(
        group="customer_payment",
        subject=_brand(titles),
        body=_with(messages, _ORDER_DETAILS),
        placeholders=_ORDER_PLACEHOLDERS,
    )


def _customer_fulfillment(titles: Localized, messages: Localized) -> TemplateDefinition:
    return TemplateDefinition(
        group="customer_fulfillment",
        subject=_brand(titles),
        body=_with(messages, _SERVICES_ONLY),
        placeholders=("servizi",),
    )


# L'ordine qui e' anche quello mostrato nella sezione admin.
TEMPLATES: dict[str, TemplateDefinition] = {
    SIGNATURE_KEY: TemplateDefinition(
        group="signature",
        subject=None,
        body={
            "it": "Lo staff di ImmoAdvisor",
            "en": "The ImmoAdvisor team",
            "de": "Ihr ImmoAdvisor-Team",
            "fr": "L'équipe ImmoAdvisor",
        },
        placeholders=(),
    ),
    "contact_admin": TemplateDefinition(
        group="admin",
        subject={"it": "Nuovo messaggio di contatto da {nome} {cognome}"},
        body={
            "it": (
                "**Nome:** {nome} {cognome}\n**Email:** {email}\n**Telefono:** {telefono}\n\n"
                "**Messaggio:**\n{messaggio}"
            )
        },
        placeholders=("nome", "cognome", "email", "telefono", "messaggio"),
    ),
    "contact_admin_listing": TemplateDefinition(
        group="admin",
        subject={"it": "Richiesta informazioni per annuncio: {annuncio}"},
        body={
            "it": (
                "**Nome:** {nome} {cognome}\n**Email:** {email}\n**Telefono:** {telefono}\n"
                "**Annuncio:** {annuncio}\n\n**Messaggio:**\n{messaggio}"
            )
        },
        placeholders=("nome", "cognome", "email", "telefono", "annuncio", "messaggio"),
    ),
    "order_admin": TemplateDefinition(
        group="admin",
        subject={"it": "Ordine {stato}: CHF {totale} da {cliente}"},
        body={"it": "**Stato pagamento:** {stato}\n**Cliente:** {cliente}\n" + _ORDER_DETAILS["it"]},
        placeholders=("stato", "cliente", *_ORDER_PLACEHOLDERS),
    ),
    "contact_customer": TemplateDefinition(
        group="customer_contact",
        subject=_brand(
            {
                "it": "Abbiamo ricevuto il tuo messaggio",
                "en": "We have received your message",
                "de": "Wir haben Ihre Nachricht erhalten",
                "fr": "Nous avons bien reçu votre message",
            }
        ),
        body=_with(
            {
                "it": "Ciao {nome},\n\ngrazie per averci scritto! Abbiamo ricevuto il tuo messaggio e ti risponderemo il prima possibile.",
                "en": "Hello {nome},\n\nthank you for writing to us! We have received your message and will get back to you as soon as possible.",
                "de": "Guten Tag {nome}\n\nvielen Dank für Ihre Nachricht! Wir haben sie erhalten und melden uns so bald wie möglich bei Ihnen.",
                "fr": "Bonjour {nome},\n\nmerci de nous avoir écrit ! Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.",
            },
            _YOUR_MESSAGE,
        ),
        placeholders=("nome", "cognome", "messaggio"),
    ),
    "contact_customer_listing": TemplateDefinition(
        group="customer_contact",
        subject=_brand(
            {
                "it": "Richiesta ricevuta per l'annuncio {annuncio}",
                "en": "Enquiry received for listing {annuncio}",
                "de": "Anfrage zum Inserat {annuncio} erhalten",
                "fr": "Demande reçue pour l'annonce {annuncio}",
            }
        ),
        body=_with(
            {
                "it": "Ciao {nome},\n\ngrazie per l'interesse! Abbiamo ricevuto la tua richiesta di informazioni sull'annuncio **{annuncio}** e ti ricontatteremo il prima possibile.",
                "en": "Hello {nome},\n\nthank you for your interest! We have received your enquiry about listing **{annuncio}** and will get back to you as soon as possible.",
                "de": "Guten Tag {nome}\n\nvielen Dank für Ihr Interesse! Wir haben Ihre Anfrage zum Inserat **{annuncio}** erhalten und melden uns so bald wie möglich bei Ihnen.",
                "fr": "Bonjour {nome},\n\nmerci de votre intérêt ! Nous avons bien reçu votre demande concernant l'annonce **{annuncio}** et vous recontacterons dans les meilleurs délais.",
            },
            _YOUR_MESSAGE,
        ),
        placeholders=("nome", "cognome", "annuncio", "messaggio"),
    ),
    "customer_payment_paid": _customer_payment(
        {"it": "Pagamento confermato", "en": "Payment confirmed", "de": "Zahlung bestätigt", "fr": "Paiement confirmé"},
        {
            "it": "Grazie per il tuo acquisto! Abbiamo ricevuto il pagamento e a breve il nostro team prenderà in carico i servizi richiesti. Ti aggiorneremo via email man mano che procediamo.",
            "en": "Thank you for your purchase! We have received your payment and our team will shortly take charge of the requested services. We will keep you updated by email as we progress.",
            "de": "Vielen Dank für Ihren Kauf! Wir haben Ihre Zahlung erhalten und unser Team kümmert sich in Kürze um die gewünschten Leistungen. Wir halten Sie per E-Mail auf dem Laufenden.",
            "fr": "Merci pour votre achat ! Nous avons bien reçu votre paiement et notre équipe prendra en charge sous peu les services demandés. Nous vous tiendrons informé par e-mail au fur et à mesure.",
        },
    ),
    "customer_payment_active": _customer_payment(
        {
            "it": "Pagamento rateale attivo",
            "en": "Instalment plan active",
            "de": "Ratenzahlung aktiv",
            "fr": "Paiement échelonné actif",
        },
        {
            "it": "Grazie! Abbiamo ricevuto la rata e il tuo pacchetto è confermato. Le rate successive verranno addebitate automaticamente ogni mese sulla stessa carta, fino al completamento del piano.",
            "en": "Thank you! We have received your instalment and your package is confirmed. The following instalments will be charged automatically each month to the same card until the plan is complete.",
            "de": "Vielen Dank! Wir haben Ihre Rate erhalten und Ihr Paket ist bestätigt. Die weiteren Raten werden monatlich automatisch derselben Karte belastet, bis der Plan abgeschlossen ist.",
            "fr": "Merci ! Nous avons bien reçu votre mensualité et votre forfait est confirmé. Les mensualités suivantes seront débitées automatiquement chaque mois sur la même carte jusqu'à la fin du plan.",
        },
    ),
    "customer_payment_past_due": _customer_payment(
        {"it": "Rata non riuscita", "en": "Instalment failed", "de": "Rate fehlgeschlagen", "fr": "Échec de la mensualité"},
        {
            "it": "L'ultimo addebito della rata mensile non è andato a buon fine. Stripe riprova automaticamente nei prossimi giorni; se il metodo di pagamento non è più valido, aggiornalo il prima possibile per evitare l'interruzione del servizio.",
            "en": "The latest monthly instalment charge did not go through. Stripe will retry automatically over the next few days; if your payment method is no longer valid, please update it as soon as possible to avoid an interruption of the service.",
            "de": "Die letzte Belastung der Monatsrate ist fehlgeschlagen. Stripe versucht es in den nächsten Tagen automatisch erneut; ist Ihre Zahlungsmethode nicht mehr gültig, aktualisieren Sie sie bitte so bald wie möglich, um eine Unterbrechung der Leistung zu vermeiden.",
            "fr": "Le dernier prélèvement de la mensualité n'a pas abouti. Stripe réessaiera automatiquement dans les prochains jours ; si votre moyen de paiement n'est plus valable, mettez-le à jour au plus vite pour éviter l'interruption du service.",
        },
    ),
    "customer_payment_completed": _customer_payment(
        {
            "it": "Tutte le rate pagate",
            "en": "All instalments paid",
            "de": "Alle Raten bezahlt",
            "fr": "Toutes les mensualités payées",
        },
        {
            "it": "Complimenti, hai completato il pagamento rateale del tuo pacchetto! Grazie per aver scelto ImmoAdvisor.",
            "en": "Congratulations, you have completed the instalment plan for your package! Thank you for choosing ImmoAdvisor.",
            "de": "Herzlichen Glückwunsch, Sie haben die Ratenzahlung Ihres Pakets abgeschlossen! Vielen Dank, dass Sie sich für ImmoAdvisor entschieden haben.",
            "fr": "Félicitations, vous avez terminé le paiement échelonné de votre forfait ! Merci d'avoir choisi ImmoAdvisor.",
        },
    ),
    "customer_payment_cancelled": _customer_payment(
        {"it": "Pagamento non riuscito", "en": "Payment unsuccessful", "de": "Zahlung nicht erfolgreich", "fr": "Paiement non abouti"},
        {
            "it": "Il pagamento per il tuo ordine non è andato a buon fine (sessione scaduta o annullata). Nessun addebito è stato effettuato. Puoi riprovare in qualsiasi momento dal carrello; se pensi si tratti di un errore, contattaci pure.",
            "en": "The payment for your order did not go through (session expired or cancelled). No charge has been made. You can try again at any time from your cart; if you think this is a mistake, please contact us.",
            "de": "Die Zahlung für Ihre Bestellung ist nicht erfolgt (Sitzung abgelaufen oder abgebrochen). Es wurde nichts belastet. Sie können es jederzeit über den Warenkorb erneut versuchen; falls Sie einen Fehler vermuten, kontaktieren Sie uns gerne.",
            "fr": "Le paiement de votre commande n'a pas abouti (session expirée ou annulée). Aucun montant n'a été débité. Vous pouvez réessayer à tout moment depuis votre panier ; si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.",
        },
    ),
    # Abbonamento interrotto dopo che almeno una rata e' gia' stata incassata:
    # il testo di "cancelled" ("nessun addebito") sarebbe fuorviante.
    "customer_payment_installments_interrupted": TemplateDefinition(
        group="customer_payment",
        subject=_brand(
            {
                "it": "Pagamento rateale interrotto",
                "en": "Instalment plan interrupted",
                "de": "Ratenzahlung unterbrochen",
                "fr": "Paiement échelonné interrompu",
            }
        ),
        body=_with(
            {
                "it": "Il pagamento rateale del tuo pacchetto si è interrotto dopo {rate_pagate} rata/e su {rate_totali} (rata non riuscita anche dopo i tentativi automatici, oppure cancellazione richiesta). Le rate già addebitate non vengono restituite automaticamente; contattaci se pensi si tratti di un errore.",
                "en": "The instalment plan for your package stopped after {rate_pagate} of {rate_totali} instalment(s) (an instalment failed even after the automatic retries, or a cancellation was requested). Instalments already charged are not refunded automatically; contact us if you think this is a mistake.",
                "de": "Die Ratenzahlung Ihres Pakets wurde nach {rate_pagate} von {rate_totali} Rate(n) unterbrochen (Rate auch nach den automatischen Versuchen fehlgeschlagen oder Kündigung beantragt). Bereits belastete Raten werden nicht automatisch erstattet; kontaktieren Sie uns, falls Sie einen Fehler vermuten.",
                "fr": "Le paiement échelonné de votre forfait s'est interrompu après {rate_pagate} mensualité(s) sur {rate_totali} (mensualité refusée même après les tentatives automatiques, ou résiliation demandée). Les mensualités déjà débitées ne sont pas remboursées automatiquement ; contactez-nous si vous pensez qu'il s'agit d'une erreur.",
            },
            _ORDER_DETAILS,
        ),
        placeholders=("rate_pagate", "rate_totali", *_ORDER_PLACEHOLDERS),
    ),
    "customer_payment_refund_pending": _customer_payment(
        {"it": "Rimborso in corso", "en": "Refund in progress", "de": "Rückerstattung in Bearbeitung", "fr": "Remboursement en cours"},
        {
            "it": "Abbiamo avviato il rimborso del tuo ordine. L'accredito sul tuo metodo di pagamento richiede in genere alcuni giorni lavorativi; ti confermeremo via email al completamento.",
            "en": "We have started the refund of your order. It usually takes a few business days to reach your payment method; we will confirm by email once it is complete.",
            "de": "Wir haben die Rückerstattung Ihrer Bestellung veranlasst. Die Gutschrift auf Ihrer Zahlungsmethode dauert in der Regel einige Werktage; wir bestätigen Ihnen den Abschluss per E-Mail.",
            "fr": "Nous avons lancé le remboursement de votre commande. Le crédit sur votre moyen de paiement prend généralement quelques jours ouvrables ; nous vous le confirmerons par e-mail une fois terminé.",
        },
    ),
    "customer_payment_refunded": _customer_payment(
        {"it": "Rimborso completato", "en": "Refund completed", "de": "Rückerstattung abgeschlossen", "fr": "Remboursement effectué"},
        {
            "it": "Il rimborso del tuo ordine è stato completato. L'importo è stato accreditato sul tuo metodo di pagamento originale.",
            "en": "The refund of your order has been completed. The amount has been credited to your original payment method.",
            "de": "Die Rückerstattung Ihrer Bestellung ist abgeschlossen. Der Betrag wurde Ihrer ursprünglichen Zahlungsmethode gutgeschrieben.",
            "fr": "Le remboursement de votre commande est terminé. Le montant a été crédité sur votre moyen de paiement d'origine.",
        },
    ),
    "customer_payment_pending": _customer_payment(
        {
            "it": "Ordine in attesa di pagamento",
            "en": "Order awaiting payment",
            "de": "Bestellung wartet auf Zahlung",
            "fr": "Commande en attente de paiement",
        },
        {
            "it": "Il tuo ordine è stato creato ed è in attesa di conferma del pagamento.",
            "en": "Your order has been created and is awaiting payment confirmation.",
            "de": "Ihre Bestellung wurde erstellt und wartet auf die Zahlungsbestätigung.",
            "fr": "Votre commande a été créée et attend la confirmation du paiement.",
        },
    ),
    "customer_fulfillment_pending": _customer_fulfillment(
        {"it": "Ordine ricevuto", "en": "Order received", "de": "Bestellung erhalten", "fr": "Commande reçue"},
        {
            "it": "Il tuo ordine è stato ricevuto e sarà presto preso in carico dal nostro team.",
            "en": "Your order has been received and will soon be handled by our team.",
            "de": "Ihre Bestellung ist eingegangen und wird in Kürze von unserem Team bearbeitet.",
            "fr": "Votre commande a bien été reçue et sera bientôt prise en charge par notre équipe.",
        },
    ),
    "customer_fulfillment_processing": _customer_fulfillment(
        {"it": "Ordine preso in carico", "en": "Order in progress", "de": "Bestellung in Bearbeitung", "fr": "Commande en cours de traitement"},
        {
            "it": "Il tuo ordine è stato preso in carico dal nostro team e siamo al lavoro sui servizi richiesti.",
            "en": "Our team has taken charge of your order and we are working on the requested services.",
            "de": "Unser Team hat Ihre Bestellung übernommen und arbeitet an den gewünschten Leistungen.",
            "fr": "Notre équipe a pris en charge votre commande et travaille sur les services demandés.",
        },
    ),
    "customer_fulfillment_completed": _customer_fulfillment(
        {"it": "Ordine completato", "en": "Order completed", "de": "Bestellung abgeschlossen", "fr": "Commande terminée"},
        {
            "it": "Tutti i servizi del tuo ordine sono stati completati. Grazie per aver scelto ImmoAdvisor!",
            "en": "All the services in your order have been completed. Thank you for choosing ImmoAdvisor!",
            "de": "Alle Leistungen Ihrer Bestellung sind abgeschlossen. Vielen Dank, dass Sie sich für ImmoAdvisor entschieden haben!",
            "fr": "Tous les services de votre commande ont été réalisés. Merci d'avoir choisi ImmoAdvisor !",
        },
    ),
}

# Valore di {rate} per un ordine a rate, per lingua.
INSTALLMENTS_LINE: Localized = {
    "it": "Rate pagate: {paid} di {total}",
    "en": "Instalments paid: {paid} of {total}",
    "de": "Bezahlte Raten: {paid} von {total}",
    "fr": "Mensualités payées : {paid} sur {total}",
}

# Dati di esempio per l'anteprima nella sezione admin.
_SAMPLE_COMMON: dict[str, str] = {
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "telefono": "+41 79 123 45 67",
    "annuncio": "IA-1024",
    "stato": "Pagato",
    "cliente": "mario.rossi@example.com",
    "totale": "1'490.00",
    "rate_pagate": "2",
    "rate_totali": "6",
    "servizi": "• Fotografia professionale — CHF 490.00\n• Pubblicazione annuncio — CHF 1'000.00",
}
_SAMPLE_MESSAGE: Localized = {
    "it": "Buongiorno, vorrei maggiori informazioni.\nGrazie!",
    "en": "Hello, I would like more information.\nThank you!",
    "de": "Guten Tag, ich hätte gerne weitere Informationen.\nDanke!",
    "fr": "Bonjour, je souhaiterais plus d'informations.\nMerci !",
}


def sample_values(locale: str) -> dict[str, str]:
    return {
        **_SAMPLE_COMMON,
        "messaggio": _SAMPLE_MESSAGE.get(locale, _SAMPLE_MESSAGE[DEFAULT_LOCALE]),
        "rate": INSTALLMENTS_LINE.get(locale, INSTALLMENTS_LINE[DEFAULT_LOCALE]).format(paid=2, total=6),
    }
