import { apiFetch } from "@/lib/apiClient";

export interface ContactFormPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message: string;
}

export function submitContactMessage(payload: ContactFormPayload): Promise<void> {
  return apiFetch<void>("/api/v1/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
