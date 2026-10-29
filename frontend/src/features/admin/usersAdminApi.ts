import { apiFetch } from "@/lib/apiClient";

export interface AdminProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string | null;
  canton: string | null;
  avs_number: string | null;
  is_admin: boolean;
  created_at: string;
}

export function listAdminUsers(accessToken: string): Promise<AdminProfile[]> {
  return apiFetch<AdminProfile[]>("/api/v1/admin/users", { accessToken });
}

export function deleteAdminUser(userId: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/users/${userId}`, { method: "DELETE", accessToken });
}

// Email destinate allo staff: "order" = ordini e pagamenti, "contact" = messaggi dal form contatti.
export type AdminSubscription = "order" | "contact";
export const ADMIN_SUBSCRIPTIONS: AdminSubscription[] = ["order", "contact"];

export interface AdminAccount {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  subscriptions: AdminSubscription[];
}

export interface AdminCreatePayload {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  subscriptions: AdminSubscription[];
}

export function listAdmins(accessToken: string): Promise<AdminAccount[]> {
  return apiFetch<AdminAccount[]>("/api/v1/admin/users/admins", { accessToken });
}

export function createAdmin(
  payload: AdminCreatePayload,
  accessToken: string
): Promise<{ id: string; status: "created" | "promoted" }> {
  return apiFetch("/api/v1/admin/users/admins", { method: "POST", body: JSON.stringify(payload), accessToken });
}

export function updateAdminSubscriptions(
  userId: string,
  subscriptions: AdminSubscription[],
  accessToken: string
): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/users/${userId}/subscriptions`, {
    method: "PUT",
    body: JSON.stringify({ subscriptions }),
    accessToken,
  });
}

export function revokeAdmin(userId: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/users/${userId}/admin`, { method: "DELETE", accessToken });
}
