export type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled";
export type OrderItemStatus = "pending" | "processing" | "completed";

export interface OrderItem {
  id: string;
  service_id: string;
  service_name_snapshot: string;
  price_chf_snapshot: string;
  status: OrderItemStatus;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total_chf: string;
  created_at: string;
  items: OrderItem[];
}
