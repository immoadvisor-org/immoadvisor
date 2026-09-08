import { apiFetch } from "@/lib/apiClient";

export interface HowItWorksTranslation {
  title: string;
  text: string;
}

export interface HowItWorksContent extends HowItWorksTranslation {
  background_image_url: string | null;
}

export function getHowItWorksContent(locale: string): Promise<HowItWorksContent> {
  return apiFetch<HowItWorksContent>(`/api/v1/how-it-works?locale=${locale}`);
}
