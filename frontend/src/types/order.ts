export type OrderStatus = "pending" | "paid" | "processing" | "completed" | "cancelled";

export interface OrderItem {
  service_id: string;
  service_name_snapshot: string;
  price_chf_snapshot: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  total_chf: string;
  created_at: string;
  items: OrderItem[];
}
