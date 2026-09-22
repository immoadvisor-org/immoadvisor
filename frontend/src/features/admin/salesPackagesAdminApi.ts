import { apiFetch } from "@/lib/apiClient";
import type {
  AdminSalesPackage,
  AdminSalesPackagePayload,
  SalesPackagesTranslationInput,
} from "@/features/admin/types";

const BASE = "/api/v1/admin/sales-packages";

export function listAdminSalesPackages(accessToken: string): Promise<AdminSalesPackage[]> {
  return apiFetch<AdminSalesPackage[]>(BASE, { accessToken });
}

export function createAdminSalesPackage(
  payload: AdminSalesPackagePayload,
  accessToken: string
): Promise<AdminSalesPackage> {
  return apiFetch<AdminSalesPackage>(BASE, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateAdminSalesPackage(
  id: string,
  payload: Partial<AdminSalesPackagePayload>,
  accessToken: string
): Promise<AdminSalesPackage> {
  return apiFetch<AdminSalesPackage>(`${BASE}/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminSalesPackage(id: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE", accessToken });
}

export function reorderAdminSalesPackages(
  items: { id: string; display_order: number }[],
  accessToken: string
): Promise<void> {
  return apiFetch<void>(`${BASE}/reorder`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ items }),
  });
}

export interface SalesPackagesContentAdmin {
  translations: Record<string, SalesPackagesTranslationInput>;
}

export function getAdminSalesPackagesContent(accessToken: string): Promise<SalesPackagesContentAdmin> {
  return apiFetch<SalesPackagesContentAdmin>(`${BASE}/content`, { accessToken });
}

export function updateAdminSalesPackagesContent(
  translations: Record<string, SalesPackagesTranslationInput>,
  accessToken: string
): Promise<SalesPackagesContentAdmin> {
  return apiFetch<SalesPackagesContentAdmin>(`${BASE}/content`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ translations }),
  });
}
