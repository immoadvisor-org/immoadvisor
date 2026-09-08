import { apiFetch } from "@/lib/apiClient";

const BASE = "/api/v1/admin/contact";

export interface ContactSettings {
  notification_email: string | null;
}

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export function getContactSettings(accessToken: string): Promise<ContactSettings> {
  return apiFetch<ContactSettings>(`${BASE}/settings`, { accessToken });
}

export function updateContactSettings(
  notificationEmail: string | null,
  accessToken: string
): Promise<ContactSettings> {
  return apiFetch<ContactSettings>(`${BASE}/settings`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ notification_email: notificationEmail }),
  });
}

export function listContactMessages(accessToken: string): Promise<ContactMessage[]> {
  return apiFetch<ContactMessage[]>(`${BASE}/messages`, { accessToken });
}
