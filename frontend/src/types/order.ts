export type OrderPaymentStatus =
  | "pending"
  | "paid"
  | "active"
  | "past_due"
  | "completed"
  | "cancelled"
  | "refund_pending"
  | "refunded";
export type OrderFulfillmentStatus = "pending" | "processing" | "completed";
export type OrderPaymentMode = "single" | "installments";

export interface OrderItem {
  id: string;
  service_id: string | null;
  package_id: string | null;
  service_name_snapshot: string;
  price_chf_snapshot: string;
}

export interface Order {
  id: string;
  payment_status: OrderPaymentStatus;
  fulfillment_status: OrderFulfillmentStatus;
  total_chf: string;
  payment_mode: OrderPaymentMode;
  installments_total: number | null;
  installments_paid: number;
  created_at: string;
  items: OrderItem[];
}
