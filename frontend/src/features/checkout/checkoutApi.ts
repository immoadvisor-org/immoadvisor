import { apiFetch } from "@/lib/apiClient";

interface CheckoutSessionResponse {
  order_id: string;
  checkout_url: string;
}

export async function startCheckout(
  serviceIds: string[],
  locale: string,
  accessToken: string
): Promise<CheckoutSessionResponse> {
  return apiFetch<CheckoutSessionResponse>("/api/v1/checkout/session", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ service_ids: serviceIds, locale }),
  });
}
