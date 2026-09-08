import { apiFetch } from "@/lib/apiClient";

export interface HowItWorksContent {
  title: string;
  text: string;
}

export function getHowItWorksContent(locale: string): Promise<HowItWorksContent> {
  return apiFetch<HowItWorksContent>(`/api/v1/how-it-works?locale=${locale}`);
}
