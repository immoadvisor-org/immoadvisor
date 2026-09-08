import { apiFetch } from "@/lib/apiClient";
import type { AdminListing, AdminListingPayload } from "@/features/admin/listingTypes";

const BASE = "/api/v1/admin/listings";

export function listAdminListings(accessToken: string): Promise<AdminListing[]> {
  return apiFetch<AdminListing[]>(BASE, { accessToken });
}

export function createAdminListing(
  payload: AdminListingPayload,
  accessToken: string
): Promise<AdminListing> {
  return apiFetch<AdminListing>(BASE, {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateAdminListing(
  id: string,
  payload: Partial<AdminListingPayload>,
  accessToken: string
): Promise<AdminListing> {
  return apiFetch<AdminListing>(`${BASE}/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteAdminListing(id: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`${BASE}/${id}`, { method: "DELETE", accessToken });
}

export function reorderAdminListings(
  items: { id: string; display_order: number }[],
  accessToken: string
): Promise<void> {
  return apiFetch<void>(`${BASE}/reorder`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ items }),
  });
}

export function uploadAdminListingImage(
  listingId: string,
  file: File,
  accessToken: string
): Promise<AdminListing> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<AdminListing>(`${BASE}/${listingId}/images`, {
    method: "POST",
    accessToken,
    body: formData,
  });
}

export function deleteAdminListingImage(
  listingId: string,
  url: string,
  accessToken: string
): Promise<AdminListing> {
  return apiFetch<AdminListing>(`${BASE}/${listingId}/images`, {
    method: "DELETE",
    accessToken,
    body: JSON.stringify({ url }),
  });
}
