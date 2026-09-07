import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Service } from "@/features/services/types";

interface CartState {
  items: Service[];
  isDrawerOpen: boolean;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  toggleService: (service: Service) => void;
  isInCart: (serviceId: string) => boolean;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addService: (service) =>
        set((state) =>
          state.items.some((item) => item.id === service.id)
            ? state
            : { items: [...state.items, service] }
        ),

      removeService: (serviceId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== serviceId) })),

      toggleService: (service) => {
        const { isInCart, addService, removeService } = get();
        if (isInCart(service.id)) {
          removeService(service.id);
        } else {
          addService(service);
        }
      },

      isInCart: (serviceId) => get().items.some((item) => item.id === serviceId),

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      total: () => get().items.reduce((sum, item) => sum + Number(item.price_chf), 0),
    }),
    { name: "immo-cart" }
  )
);
