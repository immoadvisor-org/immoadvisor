import { apiFetch } from "@/lib/apiClient";
import type { HowItWorksTranslation } from "@/features/howItWorks/howItWorksApi";

const BASE = "/api/v1/admin/how-it-works";

export interface HowItWorksContentAdmin {
  translations: Record<string, HowItWorksTranslation>;
  background_image_url: string | null;
}

export function getAdminHowItWorksContent(accessToken: string): Promise<HowItWorksContentAdmin> {
  return apiFetch<HowItWorksContentAdmin>(BASE, { accessToken });
}

export function updateAdminHowItWorksContent(
  translations: Record<string, HowItWorksTranslation>,
  accessToken: string
): Promise<HowItWorksContentAdmin> {
  return apiFetch<HowItWorksContentAdmin>(BASE, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ translations }),
  });
}

export function uploadHowItWorksBackgroundImage(
  file: File,
  accessToken: string
): Promise<HowItWorksContentAdmin> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<HowItWorksContentAdmin>(`${BASE}/image`, {
    method: "POST",
    accessToken,
    body: formData,
  });
}

export function deleteHowItWorksBackgroundImage(accessToken: string): Promise<HowItWorksContentAdmin> {
  return apiFetch<HowItWorksContentAdmin>(`${BASE}/image`, {
    method: "DELETE",
    accessToken,
  });
}
