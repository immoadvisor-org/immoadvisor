import { apiFetch } from "@/lib/apiClient";
import type { HowItWorksContent } from "@/features/howItWorks/howItWorksApi";

const BASE = "/api/v1/admin/how-it-works";

export interface HowItWorksContentAdmin {
  translations: Record<string, HowItWorksContent>;
}

export function getAdminHowItWorksContent(accessToken: string): Promise<HowItWorksContentAdmin> {
  return apiFetch<HowItWorksContentAdmin>(BASE, { accessToken });
}

export function updateAdminHowItWorksContent(
  translations: Record<string, HowItWorksContent>,
  accessToken: string
): Promise<HowItWorksContentAdmin> {
  return apiFetch<HowItWorksContentAdmin>(BASE, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ translations }),
  });
}
