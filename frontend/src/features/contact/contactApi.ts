import { apiFetch } from "@/lib/apiClient";

export interface ContactFormPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message: string;
  listing_reference?: string;
  // Lingua del sito: la conferma al cliente viene scritta in questa lingua.
  locale?: string;
}

export function submitContactMessage(payload: ContactFormPayload): Promise<void> {
  return apiFetch<void>("/api/v1/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
