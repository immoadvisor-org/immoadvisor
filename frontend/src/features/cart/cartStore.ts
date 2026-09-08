import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Service } from "@/features/services/types";

interface CartState {
  items: Service[];
  isDrawerOpen: boolean;
  ownerUserId: string | null;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  toggleService: (service: Service) => void;
  isInCart: (serviceId: string) => boolean;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  total: () => number;
  syncUser: (userId: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      ownerUserId: null,

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

      // Il carrello è persistito in localStorage: su un browser condiviso,
      // se cambia l'utente autenticato (login di un altro account, o logout)
      // il carrello del precedente non deve restare visibile al successivo.
      syncUser: (userId) => {
        const current = get().ownerUserId;
        if (current === userId) return;
        if (current !== null) {
          set({ items: [], ownerUserId: userId });
        } else {
          set({ ownerUserId: userId });
        }
      },
    }),
    { name: "immo-cart" }
  )
);
