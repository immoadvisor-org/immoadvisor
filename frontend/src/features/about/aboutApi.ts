import { apiFetch } from "@/lib/apiClient";

export interface AboutContent {
  title: string;
  intro: string;
  value1_title: string;
  value1_text: string;
  value2_title: string;
  value2_text: string;
  value3_title: string;
  value3_text: string;
  cta_title: string;
  cta_text: string;
  cta_button: string;
}

export interface AboutImages {
  // Caricate da Admin → Chi siamo; null = immagine predefinita.
  main_image_url?: string | null;
  cta_image_url?: string | null;
}

export type AboutContentWithImages = AboutContent & AboutImages;

// Immagini usate finché l'admin non ne carica di proprie.
export const DEFAULT_ABOUT_MAIN_IMAGE = "/about-team.webp";
export const DEFAULT_ABOUT_CTA_IMAGE = "/hero-illustration.svg?v=2";

export function getAboutContent(locale: string): Promise<AboutContentWithImages> {
  return apiFetch<AboutContentWithImages>(`/api/v1/about?locale=${locale}`);
}
