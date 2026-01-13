import { create } from "zustand";
import { persist } from "zustand/middleware";
import restApi from "../woo_rest_api/rest_api";

const defaultCartState = {
  items: [],
  quantity: 0,
  subtotal: "0",
  total: "0",
  items_count: 0,
  loading: false,
};

export const useRestCart = create((set, get) => ({
  // Initial state
  ...defaultCartState,
  loading: false,

  // Actions
  updateCart: (cart) => set(cart),

  fetchCart: async () => {
    set({ loading: true });
    const cart = await restApi.getCart();
    set({ ...cart, loading: false });
  },
}));
