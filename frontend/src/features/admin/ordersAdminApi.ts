import { apiFetch } from "@/lib/apiClient";
import type { Order } from "@/types/order";

export interface AdminOrder extends Order {
  email: string | null;
}

export function listAllOrders(accessToken: string): Promise<AdminOrder[]> {
  return apiFetch<AdminOrder[]>("/api/v1/admin/orders", { accessToken });
}
