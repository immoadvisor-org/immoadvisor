import { apiFetch } from "@/lib/apiClient";

const BASE = "/api/v1/admin/legal";

export interface LegalTranslation {
  content: string;
}

export interface LegalContentAdmin {
  translations: Record<string, LegalTranslation>;
}

export function getAdminLegalContent(accessToken: string): Promise<LegalContentAdmin> {
  return apiFetch<LegalContentAdmin>(BASE, { accessToken });
}

export function updateAdminLegalContent(
  translations: Record<string, LegalTranslation>,
  accessToken: string
): Promise<LegalContentAdmin> {
  return apiFetch<LegalContentAdmin>(BASE, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ translations }),
  });
}
