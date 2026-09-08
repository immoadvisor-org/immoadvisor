import { apiFetch } from "@/lib/apiClient";

const BASE = "/api/v1/admin/contact";

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export function listContactMessages(accessToken: string): Promise<ContactMessage[]> {
  return apiFetch<ContactMessage[]>(`${BASE}/messages`, { accessToken });
}
