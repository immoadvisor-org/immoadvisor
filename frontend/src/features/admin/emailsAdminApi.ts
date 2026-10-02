import { apiFetch } from "@/lib/apiClient";

const BASE = "/api/v1/admin/emails";

export type EmailTemplateGroup = "signature" | "admin" | "customer_contact" | "customer_payment" | "customer_fulfillment";

export const EMAIL_TEMPLATE_GROUPS: EmailTemplateGroup[] = [
  "signature",
  "admin",
  "customer_contact",
  "customer_payment",
  "customer_fulfillment",
];

export interface EmailTemplateAdmin {
  key: string;
  group: EmailTemplateGroup;
  // Lingua di questi testi e lingue in cui il modello si scrive (le
  // notifiche allo staff solo in quella predefinita).
  locale: string;
  locales: string[];
  customized_locales: string[];
  // La firma non ha oggetto: subject e default_subject sono null.
  subject: string | null;
  body: string;
  show_logo: boolean;
  default_subject: string | null;
  default_body: string;
  placeholders: string[];
  is_customized: boolean;
}

export interface EmailTemplateInput {
  subject: string | null;
  body: string;
  show_logo: boolean;
}

export interface EmailPreview {
  subject: string | null;
  html: string;
}

function withLocale(path: string, locale?: string): string {
  return locale ? `${path}?locale=${encodeURIComponent(locale)}` : path;
}

export function listAdminEmailTemplates(accessToken: string, locale?: string): Promise<EmailTemplateAdmin[]> {
  return apiFetch<EmailTemplateAdmin[]>(withLocale(BASE, locale), { accessToken });
}

export function getAdminEmailTemplate(key: string, locale: string, accessToken: string): Promise<EmailTemplateAdmin> {
  return apiFetch<EmailTemplateAdmin>(withLocale(`${BASE}/${key}`, locale), { accessToken });
}

export function saveAdminEmailTemplate(
  key: string,
  locale: string,
  input: EmailTemplateInput,
  accessToken: string
): Promise<EmailTemplateAdmin> {
  return apiFetch<EmailTemplateAdmin>(withLocale(`${BASE}/${key}`, locale), {
    method: "PUT",
    accessToken,
    body: JSON.stringify(input),
  });
}

export function resetAdminEmailTemplate(key: string, locale: string, accessToken: string): Promise<EmailTemplateAdmin> {
  return apiFetch<EmailTemplateAdmin>(withLocale(`${BASE}/${key}`, locale), { method: "DELETE", accessToken });
}

export function previewAdminEmailTemplate(
  key: string,
  locale: string,
  input: EmailTemplateInput,
  accessToken: string
): Promise<EmailPreview> {
  return apiFetch<EmailPreview>(withLocale(`${BASE}/${key}/preview`, locale), {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}
