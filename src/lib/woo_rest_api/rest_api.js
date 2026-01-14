import WooClient from "./woo_client.js";

class WooRestApi extends WooClient {
  constructor(url) {
    super(url);
  }

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
}

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const wooRestApi = new WooRestApi(`${wpUrl}/wp-json/wc/store/v1`);

export default wooRestApi;
