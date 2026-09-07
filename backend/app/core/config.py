from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str

    supabase_url: str
    # Endpoint pubblico delle chiavi di verifica JWT (Connect -> Set environment
    # variables, o Project Settings -> JWT Keys). Non è un segreto: espone solo
    # le chiavi pubbliche usate per verificare la firma dei token, mai per crearla.
    supabase_jwks_url: str
    # "Secret key" nel pannello Supabase (Project Settings -> API Keys). Non è
    # ancora usata dal codice: il backend parla con Postgres direttamente via
    # DATABASE_URL. Tenuta pronta per eventuali chiamate future alle API
    # Supabase (es. Storage) con privilegi elevati.
    supabase_secret_key: str

    stripe_secret_key: str
    stripe_webhook_secret: str

    # Una o più origini separate da virgola (es. per testare da telefono sulla
    # stessa rete: "http://localhost:3000,http://192.168.1.42:3000")
    frontend_url: str = "http://localhost:3000"

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_url.split(",") if origin.strip()]

    immoscout_api_key: str = ""
    immoscout_api_base_url: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
