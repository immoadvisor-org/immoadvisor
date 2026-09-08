import { apiFetch } from "@/lib/apiClient";

export interface LegalContent {
  content: string;
}

export function getLegalContent(locale: string): Promise<LegalContent> {
  return apiFetch<LegalContent>(`/api/v1/legal?locale=${locale}`);
}
