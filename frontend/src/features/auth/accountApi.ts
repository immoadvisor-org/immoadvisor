import { apiFetch } from "@/lib/apiClient";

export function deleteMyAccount(accessToken: string): Promise<void> {
  return apiFetch<void>("/api/v1/account", { method: "DELETE", accessToken });
}
