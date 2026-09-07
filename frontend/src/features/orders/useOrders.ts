"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/apiClient";
import type { Order } from "@/types/order";

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

export function useOrders(accessToken: string | undefined): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    apiFetch<Order[]>("/api/v1/orders", { accessToken })
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  return { orders, isLoading, error };
}
