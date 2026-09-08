import { apiFetch } from "@/lib/apiClient";

export type NotificationPurpose = "contact" | "order";

export interface NotificationRecipient {
  id: string;
  email: string;
}

export function listNotificationRecipients(
  purpose: NotificationPurpose,
  accessToken: string
): Promise<NotificationRecipient[]> {
  return apiFetch<NotificationRecipient[]>(`/api/v1/admin/notifications/${purpose}`, { accessToken });
}

export function addNotificationRecipient(
  purpose: NotificationPurpose,
  email: string,
  accessToken: string
): Promise<NotificationRecipient> {
  return apiFetch<NotificationRecipient>(`/api/v1/admin/notifications/${purpose}`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ email }),
  });
}

export function removeNotificationRecipient(id: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`/api/v1/admin/notifications/recipient/${id}`, {
    method: "DELETE",
    accessToken,
  });
}
