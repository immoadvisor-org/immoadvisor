import { apiFetch } from "@/lib/apiClient";

export interface HowItWorksStep {
  title: string;
  text: string;
}

export interface HowItWorksTranslation {
  title: string;
  text: string;
  steps: HowItWorksStep[];
}

export interface HowItWorksContent extends HowItWorksTranslation {
  visible: boolean;
}

export function getHowItWorksContent(locale: string): Promise<HowItWorksContent> {
  return apiFetch<HowItWorksContent>(`/api/v1/how-it-works?locale=${locale}`);
}
