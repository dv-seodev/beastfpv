import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import restApi from "../woo_rest_api/rest_api";

const defaultCartState = {
  cart: {
    items: [],
    quantity: 0,
    subtotal: "0",
    total: "0",
    items_count: 0,
    shipping_rates: [],
    payment_methods: [],
    totals: {},
    coupons: [],
  },
  loading: false,
  couponCode: "",
  couponMessage: "",
  couponLoading: false,

  selectedShipping: null,
  selectedPayment: null,
  cartInitialized: false,
};

export const useRestCart = create(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultCartState,
        loading: false,

        // Actions
        updateCart: (cartData) => set({ cart: cartData, loading: false }),

        fetchCart: async () => {
          set({ loading: true });
          try {
            const cartData = await restApi.getCart();
            set({ cart: cartData, loading: false, cartInitialized: true });
            await get().ensureShippingSelected();
          } catch (err) {
            console.error("❌ Ошибка при загрузке корзины:", err);
            set({ loading: false });
          }
        },

        setSelectedShipping: (shippingId) => {
          set({ selectedShipping: shippingId });
        },

        setSelectedPayment: (paymentId) => {
          set({ selectedPayment: paymentId });
        },

        setCouponCode: (code) => {
          set({ couponCode: code });
        },

        setCouponMessage: (message) => {
          set({ couponMessage: message });
        },

        handleQuantityChange: async (itemKey, newQuantity) => {
          if (newQuantity < 1) return;

          try {
            await restApi.updateCartItem({ key: itemKey, quantity: newQuantity });
            const cartData = await restApi.getCart();
            set({ cart: cartData, loading: false });
          } catch (err) {
            console.error("❌ Ошибка при изменении количества:", err);

            throw err;
          }
        },

        ensureShippingSelected: async () => {
          const cart = get().cart;
          const rates = cart?.shipping_rates;

          if (!rates || !Array.isArray(rates) || rates.length === 0) return;

          const pkg = rates[0]; // если у тебя 1 пакет доставки (чаще всего так)
          const list = pkg?.shipping_rates || [];
          if (list.length === 0) return;

          // если сервер уже выбрал — просто синхронизируем selectedShipping в state
          const serverSelected = list.find((r) => r.selected)?.rate_id;
          if (serverSelected) {
            if (get().selectedShipping !== serverSelected) {
              set({ selectedShipping: serverSelected });
            }
            return;
          }

          // сервер НЕ выбрал — выбираем сами (prefer: сохранённый выбранный → иначе первый)
          const preferred = get().selectedShipping;
          const rateId =
            preferred && list.some((r) => r.rate_id === preferred)
              ? preferred
              : list[0].rate_id;

          const newCart = await restApi.selectShippingRate(pkg.package_id, rateId);

          set({
            cart: newCart,
            selectedShipping: rateId,
          });
        },

        handleRemoveItem: async (itemKey) => {
          try {
            const newCart = await restApi.removeCartItem(itemKey);
            set({ cart: newCart });
          } catch (err) {
            console.error("❌ Ошибка при удалении товара:", err);
            throw err;
          }
        },

        handleClearCart: async () => {
          try {
            await restApi.clearCart();
            set({
              cart: {
                items: [],
                quantity: 0,
                subtotal: "0",
                total: "0",
                items_count: 0,
                shipping_rates: [],
                payment_methods: [],
                totals: {},
                coupons: [],
              },
              loading: false,
            });
          } catch (err) {
            console.error("❌ Ошибка при очистке корзины:", err);

            throw err;
          }
        },

        applyCoupon: async (code) => {
          if (!code?.trim()) {
            set({ couponMessage: "Введите код купона" });
            return;
          }

          set({ couponLoading: true, couponMessage: "" });
          try {
            const res = await restApi.applyCoupon(code);
            if (res.code && res.code == "woocommerce_rest_cart_coupon_error") {
              throw new Error(res.message);
            }
            set({ cart: res, couponLoading: false });
          } catch (err) {
            console.error("❌ Ошибка при применении купона:", err);
            set({ couponMessage: "❌ Неверный купон или купон не активен", couponLoading: false });
            throw err;
          }
        },

        removeCoupon: async (code) => {
          if (!code) return;
          set({ couponLoading: true });
          try {
            const newCart = await restApi.removeCoupon(code);
            set({ cart: newCart, couponCode: "", couponMessage: "", couponLoading: false });
          } catch (err) {
            console.error("❌ Ошибка при удалении купона:", err);
            set({ couponLoading: false });
            throw err;
          }
        },

        setupShippingRate: async (rateId) => {
          const rates = get().cart.shipping_rates;
          if (!rates || !Array.isArray(rates) || rates.length === 0) return;
          const packageId = rates[0].package_id;
          try {
            const newCart = await restApi.selectShippingRate(packageId, rateId);
            set({ cart: newCart, selectedShipping: rateId });
          } catch (err) {
            console.error("❌ Ошибка при выборе способа доставки:", err);
          }
        },

        // Selectors
        getShippingMethods: () => {
          const rates = get().cart.shipping_rates;
          if (!rates || !Array.isArray(rates) || rates.length === 0) return [];
          const methods = rates[0].shipping_rates;
          return methods.map((method) => ({
            id: method.rate_id,
            method: method.method_id,
            title: method.name,
            price: method.price,
            priceFormatted: `${method.currency_prefix}${method.price}${method.currency_suffix}`,
            selected: method.selected,
          }));
        },
      }),
      {
        name: "rest-cart-storage",
        partialize: (state) => ({
          selectedShipping: state.selectedShipping,
          selectedPayment: state.selectedPayment,
          couponCode: state.couponCode,
        }),
      }
    ),
    { name: "rest-cart-store" }
  )
);
