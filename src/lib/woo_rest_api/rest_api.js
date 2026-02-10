import WooClient from "./woo_client.js";

class WooRestApi extends WooClient {
  constructor(url) {
    super(url);
  }

  isWpError = (response) => {
    return !!(response && typeof response === "object" && response.code && response.message);
  };

  extractCartFromResponse = (response) => {
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

  normalizeAddress = (address = {}, isBilling = true) => {
    return {
      first_name: address?.first_name || "",
      last_name: address?.last_name || "",
      company: address?.company || "",
      address_1: address?.address_1 || "",
      address_2: address?.address_2 || "",
      city: address?.city || "",
      state: address?.state || "",
      postcode: address?.postcode || "119991",
      country: address?.country || "RU",
      ...(isBilling
        ? {
            email: address?.email || "",
            phone: address?.phone || "",
          }
        : {
            phone: address?.phone || "",
          }),
    };
  };

  getCart = async () => {
    return this.get("/cart");
  };

  addToCart = async ({ id, quantity = 1, variation = [] }) => {
    return this.post("/cart/add-item", { id, quantity, variation });
  };

  removeCartItem = async (key) => {
    return this.post("/cart/remove-item", { key });
  };

  updateCartItem = async ({ key, quantity = 1 }) => {
    return this.post("/cart/update-item", { key, quantity });
  };

  createOrder = async (data) => {
    return this.post("/checkout", data);
  };

  applyCoupon = async (code) => {
    return this.post("/cart/apply-coupon", { code });
  };

  removeCoupon = async (code) => {
    return this.post("/cart/remove-coupon", { code });
  };

  clearCart = async () => {
    return this.delete("/cart/items");
  };

  selectShippingRate = async (packageId, rateId) => {
    return this.post("/cart/select-shipping-rate", { package_id: packageId, rate_id: rateId });
  };

  setCartPaymentMethod = async (paymentMethod, context = {}) => {
    const normalizedShipping = this.normalizeAddress(context.shippingAddress, false);
    const normalizedBilling = this.normalizeAddress(context.billingAddress, true);

    // Some Woo setups validate billing phone even on cart-level checkout updates.
    // Provide a technical fallback so payment method can be synced and totals recalculated.
    if (!normalizedBilling.phone) {
      normalizedBilling.phone = normalizedShipping.phone || "79999999999";
    }
    if (!normalizedShipping.phone) {
      normalizedShipping.phone = normalizedBilling.phone;
    }

    const payload = {
      payment_method: paymentMethod,
      payment_data: [],
      billing_address: normalizedBilling,
      shipping_address: normalizedShipping,
      // Compatibility for custom validators that still expect flat checkout fields.
      billing_phone: normalizedBilling.phone,
      shipping_phone: normalizedShipping.phone,
      phone: normalizedBilling.phone,
    };

    // 1) Ensure customer data is stored in cart session first.
    // On some stores checkout update validates phone from session.
    const updateCustomerResult = await this.post("/cart/update-customer", {
      billing_address: normalizedBilling,
      shipping_address: normalizedShipping,
    });

    // 2) Store API checkout update.
    const checkoutPath = `/checkout?__experimental_calc_totals=true&payment_method=${encodeURIComponent(
      paymentMethod
    )}`;
    const putResult = await this.put(checkoutPath, payload);
    const putCart = this.extractCartFromResponse(putResult);
    if (putCart) {
      return putCart;
    }
    if (!this.isWpError(putResult)) {
      return putResult;
    }

    // 3) Return the most useful data we have (at minimum updated cart customer state).
    // PUT is the primary path for Store API checkout updates.
    const customerCart = this.extractCartFromResponse(updateCustomerResult);
    if (customerCart) {
      return customerCart;
    }
    if (!this.isWpError(updateCustomerResult)) {
      return updateCustomerResult;
    }

    return putResult || updateCustomerResult;
  };
}

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const wooRestApi = new WooRestApi(`${wpUrl}/wp-json/wc/store/v1`);

export default wooRestApi;
