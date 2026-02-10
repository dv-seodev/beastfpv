class WooClient {
  constructor(url) {
    this.baseUrl = url;
  }

  async get(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: this.prepareHeaders(),
    });
    this.onEveryResponse(response);
    return response.json();
  }

  async post(path, data) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      credentials: "include",
      headers: this.prepareHeaders(),
      body: JSON.stringify(data),
    });
    this.onEveryResponse(response);
    return response.json();
  }

  async put(path, data) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: this.prepareHeaders(),
      body: JSON.stringify(data),
    });
    this.onEveryResponse(response);
    return response.json();
  }

  async delete(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: this.prepareHeaders(),
    });
    this.onEveryResponse(response);
    return response.json();
  }

  storeCartToken(token) {
    localStorage.setItem("cartToken", token);
  }

  getCartToken() {
    return localStorage.getItem("cartToken");
  }

  prepareHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const nonce = localStorage.getItem("wc-nonce");
    if (nonce) {
      headers["Nonce"] = nonce;
      headers["X-WC-Store-API-Nonce"] = nonce;
    }

    const cartToken = this.getCartToken();
    if (cartToken) headers["Cart-Token"] = cartToken;

    const sessionStr = localStorage.getItem("woo-session");
    const session = sessionStr ? JSON.parse(sessionStr) : null;
    if (session) headers["woocommerce-session"] = `Session ${session.token}`;

    return headers;
  }

  onEveryResponse(response) {
    const cartToken = response.headers.get("Cart-Token");
    if (cartToken) this.storeCartToken(cartToken);

    const session = response.headers.get("woocommerce-session");
    if (session) {
      localStorage.setItem(
        "woo-session",
        JSON.stringify({ token: session, createdTime: Date.now() })
      );
    }

    const nonce = response.headers.get("Nonce");
    if (nonce) localStorage.setItem("wc-nonce", nonce);
  }
}

export default WooClient;
