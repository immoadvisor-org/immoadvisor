import { apiFetch } from "@/lib/apiClient";

const BASE = "/api/v1/admin/contact";

export type ContactMessageStatus = "received" | "contacted" | "to_recontact" | "completed";

export interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  listing_reference: string | null;
  status: ContactMessageStatus;
  notes: string | null;
  created_at: string;
}

export function listContactMessages(accessToken: string): Promise<ContactMessage[]> {
  return apiFetch<ContactMessage[]>(`${BASE}/messages`, { accessToken });
}

export function updateContactMessage(
  id: string,
  payload: { status?: ContactMessageStatus; notes?: string | null },
  accessToken: string
): Promise<ContactMessage> {
  return apiFetch<ContactMessage>(`${BASE}/messages/${id}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(payload),
  });
}
