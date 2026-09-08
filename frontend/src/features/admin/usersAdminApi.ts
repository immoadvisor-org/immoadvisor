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
