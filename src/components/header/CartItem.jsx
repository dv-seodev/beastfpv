"use client";
import Link from "next/link";
import { useEffect, useMemo, useCallback } from "react";
import { useRestCart } from "../../lib/hooks/useRestCart";

const CART_EVENTS = ["cartUpdated", "cartItemChanged", "cartCleared"];

const CartIcon = () => {
  const { cart, loading } = useRestCart();
  const items_count = cart?.items_count || 0;
  const isLoading = loading;

  const cartState = useRestCart((state) => state);

  return (
    <Link href="/cart" className="icon-action cart-icon">
      <img src="/icons-header/basket.svg" alt="cart" />
      {!isLoading && items_count > 0 && <span className="cart-icon__badge">{items_count}</span>}
    </Link>
  );
};

export default CartIcon;
