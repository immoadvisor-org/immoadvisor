import { apiFetch } from "@/lib/apiClient";
import type { AboutContent } from "@/features/about/aboutApi";

const BASE = "/api/v1/admin/about";

export interface AboutContentAdmin {
  translations: Record<string, AboutContent>;
}

export function getAdminAboutContent(accessToken: string): Promise<AboutContentAdmin> {
  return apiFetch<AboutContentAdmin>(BASE, { accessToken });
}

export function updateAdminAboutContent(
  translations: Record<string, AboutContent>,
  accessToken: string
): Promise<AboutContentAdmin> {
  return apiFetch<AboutContentAdmin>(BASE, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ translations }),
  });
}
