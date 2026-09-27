import { apiFetch } from "@/lib/apiClient";
import type { AboutContent, AboutImages } from "@/features/about/aboutApi";

const BASE = "/api/v1/admin/about";

export type AboutImageSlot = "main" | "cta";

export interface AboutContentAdmin extends AboutImages {
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

export function uploadAdminAboutImage(slot: AboutImageSlot, file: File, accessToken: string): Promise<AboutContentAdmin> {
  const body = new FormData();
  body.append("file", file);
  return apiFetch<AboutContentAdmin>(`${BASE}/images/${slot}`, { method: "POST", accessToken, body });
}

export function removeAdminAboutImage(slot: AboutImageSlot, accessToken: string): Promise<AboutContentAdmin> {
  return apiFetch<AboutContentAdmin>(`${BASE}/images/${slot}`, { method: "DELETE", accessToken });
}
