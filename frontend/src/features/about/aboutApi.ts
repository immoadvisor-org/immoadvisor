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

export function getAboutContent(locale: string): Promise<AboutContent> {
  return apiFetch<AboutContent>(`/api/v1/about?locale=${locale}`);
}
