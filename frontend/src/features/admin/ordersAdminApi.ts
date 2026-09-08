import { apiFetch } from "@/lib/apiClient";
import type { Order, OrderFulfillmentStatus } from "@/types/order";

export interface AdminOrder extends Order {
  email: string | null;
}

export function listAllOrders(accessToken: string): Promise<AdminOrder[]> {
  return apiFetch<AdminOrder[]>("/api/v1/admin/orders", { accessToken });
}

export function getAdminOrder(orderId: string, accessToken: string): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(`/api/v1/admin/orders/${orderId}`, { accessToken });
}

export function updateFulfillmentStatus(
  orderId: string,
  newStatus: OrderFulfillmentStatus,
  accessToken: string
): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(`/api/v1/admin/orders/${orderId}/fulfillment-status`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status: newStatus }),
  });
}

export function refundOrder(orderId: string, accessToken: string): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(`/api/v1/admin/orders/${orderId}/refund`, {
    method: "POST",
    accessToken,
  });
}
