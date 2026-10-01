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

export function listAdminEmailTemplates(accessToken: string): Promise<EmailTemplateAdmin[]> {
  return apiFetch<EmailTemplateAdmin[]>(BASE, { accessToken });
}

export function getAdminEmailTemplate(key: string, accessToken: string): Promise<EmailTemplateAdmin> {
  return apiFetch<EmailTemplateAdmin>(`${BASE}/${key}`, { accessToken });
}

export function saveAdminEmailTemplate(
  key: string,
  input: EmailTemplateInput,
  accessToken: string
): Promise<EmailTemplateAdmin> {
  return apiFetch<EmailTemplateAdmin>(`${BASE}/${key}`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify(input),
  });
}

export function resetAdminEmailTemplate(key: string, accessToken: string): Promise<EmailTemplateAdmin> {
  return apiFetch<EmailTemplateAdmin>(`${BASE}/${key}`, { method: "DELETE", accessToken });
}

export function previewAdminEmailTemplate(
  key: string,
  input: EmailTemplateInput,
  accessToken: string
): Promise<EmailPreview> {
  return apiFetch<EmailPreview>(`${BASE}/${key}/preview`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
}
