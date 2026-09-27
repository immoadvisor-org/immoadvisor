import { apiFetch } from "@/lib/apiClient";
import type { PageIntroSettings } from "@/features/pageIntro/pageIntroApi";

const BASE = "/api/v1/admin/page-intro-settings";

export function getAdminPageIntroSettings(accessToken: string): Promise<PageIntroSettings> {
  return apiFetch<PageIntroSettings>(BASE, { accessToken });
}

export function updateAdminPageIntroSettings(
  payload: PageIntroSettings,
  accessToken: string
): Promise<PageIntroSettings> {
  return apiFetch<PageIntroSettings>(BASE, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}
