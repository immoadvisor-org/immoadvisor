class DomainError(Exception):
    """Errore di business, mappato a una risposta HTTP dal layer API."""


class ServiceNotFoundError(DomainError):
    pass


class OrderNotFoundError(DomainError):
    pass


class OrderNotRefundableError(DomainError):
    pass


class InvalidFulfillmentTransitionError(DomainError):
    pass


class ServiceInUseError(DomainError):
    pass


class InvalidImageError(DomainError):
    pass


class ListingNotFoundError(DomainError):
    pass
