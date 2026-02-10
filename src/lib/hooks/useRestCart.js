import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import restApi from "../woo_rest_api/rest_api";

let paymentSyncInFlight = null;
let paymentSyncInFlightMethod = null;
let lastPaymentSyncMethod = null;
let lastPaymentSyncAt = 0;
let fetchCartInFlight = null;

const extractCartFromPaymentResponse = (response) => {
  if (!response || typeof response !== "object") return null;
  if (Array.isArray(response.items) && response.totals) return response;
  if (response.__experimentalCart && Array.isArray(response.__experimentalCart.items)) {
    return response.__experimentalCart;
  }
  if (response.cart && Array.isArray(response.cart.items)) {
    return response.cart;
  }
  if (response.data?.cart && Array.isArray(response.data.cart.items)) {
    return response.data.cart;
  }
  return null;
};

const isSoftPaymentSyncError = (response) => {
  const code = response?.code ? String(response.code).toLowerCase() : "";
  const message = response?.message ? String(response.message).toLowerCase() : "";
  if (!code) return false;
  if (code === "rest_no_route") return true;
  if (code === "wc_session_missing") return true;
  if (code.startsWith("woocommerce_rest_")) return true;
  if (code.startsWith("woocommerce_rest_checkout_")) return true;
  if (message.includes("billing_address")) return true;
  if (message.includes("wc session is not available")) return true;
  return false;
};

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
          if (fetchCartInFlight) {
            return fetchCartInFlight;
          }

          const run = (async () => {
            set({ loading: true });
            try {
              const cartData = await restApi.getCart();
              set({ cart: cartData, loading: false, cartInitialized: true });
              await get().ensureShippingSelected();
              return cartData;
            } catch (err) {
              console.error("❌ Ошибка при загрузке корзины:", err);
              set({ loading: false });
              throw err;
            } finally {
              if (fetchCartInFlight === run) {
                fetchCartInFlight = null;
              }
            }
          })();

          fetchCartInFlight = run;
          return run;
        },

        setSelectedShipping: (shippingId) => {
          set({ selectedShipping: shippingId });
        },

        setSelectedPayment: (paymentId) => {
          set({ selectedPayment: paymentId });
        },

        syncSelectedPayment: async (paymentId) => {
          if (!paymentId) return;

          const recentSyncWindowMs = 2000;
          if (
            lastPaymentSyncMethod === paymentId &&
            Date.now() - lastPaymentSyncAt < recentSyncWindowMs
          ) {
            return get().cart;
          }

          if (paymentSyncInFlight) {
            if (paymentSyncInFlightMethod === paymentId) {
              return paymentSyncInFlight;
            }
            try {
              await paymentSyncInFlight;
            } catch (_) {
              // ignore previous sync error and continue with the latest requested method
            }
          }

          // Optimistic local state for immediate UI feedback.
          set({ selectedPayment: paymentId });

          const run = (async () => {
            const currentCart = get().cart || {};
            const response = await restApi.setCartPaymentMethod(paymentId, {
              billingAddress: currentCart.billing_address,
              shippingAddress: currentCart.shipping_address,
            });

            const cartFromResponse = extractCartFromPaymentResponse(response);
            if (cartFromResponse) {
              set({ cart: cartFromResponse });
              return cartFromResponse;
            }

            if (response?.code) {
              if (isSoftPaymentSyncError(response)) {
                const cartData = await restApi.getCart();
                set({ cart: cartData });
                return cartData;
              }

              throw new Error(response.message || "Ошибка при выборе способа оплаты");
            }

            // Fallback for custom endpoint responses like { ok: true }.
            const cartData = await restApi.getCart();
            set({ cart: cartData });
            return cartData;
          })();

          paymentSyncInFlight = run;
          paymentSyncInFlightMethod = paymentId;

          try {
            const result = await run;
            lastPaymentSyncMethod = paymentId;
            lastPaymentSyncAt = Date.now();
            return result;
          } finally {
            if (paymentSyncInFlight === run) {
              paymentSyncInFlight = null;
              paymentSyncInFlightMethod = null;
            }
          }
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
