export type OrderPaymentStatus = "pending" | "paid" | "cancelled" | "refund_pending" | "refunded";
export type OrderFulfillmentStatus = "pending" | "processing" | "completed";

export interface OrderItem {
  id: string;
  service_id: string;
  service_name_snapshot: string;
  price_chf_snapshot: string;
}

export interface Order {
  id: string;
  payment_status: OrderPaymentStatus;
  fulfillment_status: OrderFulfillmentStatus;
  total_chf: string;
  created_at: string;
  items: OrderItem[];
}
