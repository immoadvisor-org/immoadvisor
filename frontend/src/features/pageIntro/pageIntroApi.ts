import { apiFetch } from "@/lib/apiClient";

export interface PageIntroSettings {
  show_configurator_intro: boolean;
  show_listings_intro: boolean;
}

// Se il backend non risponde, l'intro resta visibile (fail-open): è solo un
// banner decorativo, nasconderlo per un errore transitorio sarebbe peggio
// che mostrarlo quando l'admin non l'ha esplicitamente disattivato.
const DEFAULT_SETTINGS: PageIntroSettings = {
  show_configurator_intro: true,
  show_listings_intro: true,
};

export async function getPageIntroSettings(): Promise<PageIntroSettings> {
  try {
    return await apiFetch<PageIntroSettings>("/api/v1/page-intro-settings");
  } catch {
    return DEFAULT_SETTINGS;
  }
}
