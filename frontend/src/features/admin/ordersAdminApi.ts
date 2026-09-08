import { apiFetch } from "@/lib/apiClient";
import type { Order, OrderItemStatus, OrderStatus } from "@/types/order";

export interface AdminOrder extends Order {
  email: string | null;
}

export function listAllOrders(accessToken: string): Promise<AdminOrder[]> {
  return apiFetch<AdminOrder[]>("/api/v1/admin/orders", { accessToken });
}

export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  accessToken: string
): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(`/api/v1/admin/orders/${orderId}/status`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status: newStatus }),
  });
}

export function updateOrderItemStatus(
  orderId: string,
  itemId: string,
  newStatus: OrderItemStatus,
  accessToken: string
): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(`/api/v1/admin/orders/${orderId}/items/${itemId}/status`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ status: newStatus }),
  });
}
