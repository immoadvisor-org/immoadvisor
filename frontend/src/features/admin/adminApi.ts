import { apiFetch } from "@/lib/apiClient";
import type { AdminService, AdminServicePayload } from "@/features/admin/types";

const BASE = "/api/v1/admin/services";

export function listAdminServices(accessToken: string): Promise<AdminService[]> {
  return apiFetch<AdminService[]>(BASE, { accessToken });
}

export function createAdminService(
  payload: AdminServicePayload,
  accessToken: string
): Promise<AdminService> {
  return apiFetch<AdminService>(BASE, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateAdminService(
  id: string,
  payload: Partial<AdminServicePayload>,
  accessToken: string
): Promise<AdminService> {
  return apiFetch<AdminService>(`${BASE}/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminService(id: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE", accessToken });
}

export function reorderAdminServices(
  items: { id: string; display_order: number }[],
  accessToken: string
): Promise<void> {
  return apiFetch<void>(`${BASE}/reorder`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ items }),
  });
}

export function uploadAdminServiceImage(
  serviceId: string,
  file: File,
  accessToken: string
): Promise<AdminService> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<AdminService>(`${BASE}/${serviceId}/images`, {
    method: "POST",
    accessToken,
    body: formData,
  });
}

export function deleteAdminServiceImage(
  serviceId: string,
  url: string,
  accessToken: string
): Promise<AdminService> {
  return apiFetch<AdminService>(`${BASE}/${serviceId}/images`, {
    method: "DELETE",
    accessToken,
    body: JSON.stringify({ url }),
  });
}
