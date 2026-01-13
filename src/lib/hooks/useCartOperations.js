import { useState } from "react";
import { useQuery } from "@apollo/client";
import client from "../ApolloClient";
import api from "../api";
import { useCartStore } from "../../stores/cartStore";
import { parsePrice } from "../utils/price";
import {
  transformCartItems,
  transformShippingMethods,
  transformPaymentMethods,
} from "../utils/cart";

/**
 * Хук для работы с операциями корзины через GraphQL
 */
export const useCartOperations = () => {
  const { updateCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Запрос данных корзины
  const cartQuery = useQuery(api.getCart(), {
    errorPolicy: "all",
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const graphQLCart = cartQuery?.data?.cart || null;
  const cartItems = transformCartItems(graphQLCart?.contents?.nodes);
  const shippingMethods = transformShippingMethods(graphQLCart?.availableShippingMethods);
  const paymentMethods = transformPaymentMethods(cartQuery?.data?.paymentGateways?.nodes);

  const baseTotal = graphQLCart?.subtotal ? parsePrice(graphQLCart.subtotal) : 0;
  const finalTotal = graphQLCart?.total ? parsePrice(graphQLCart.total) : 0;

  // Обновление количества товара
  const handleQuantityChange = async (itemKey, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      const UpdateQuantity = api.updateItemQuantities();
      const { data } = await client.mutate({
        mutation: UpdateQuantity,
        variables: {
          input: {
            items: [{ key: itemKey, quantity: newQuantity }],
          },
        },
      });

      if (data?.updateItemQuantities?.cart) {
        updateCart(data.updateItemQuantities.cart);
        updateQuantity(itemKey, newQuantity);
      }

      await cartQuery.refetch();
    } catch (err) {
      console.error("❌ Ошибка при изменении количества:", err);
      alert("❌ Ошибка при изменении количества товара");
    } finally {
      setIsUpdating(false);
    }
  };

  // Удаление товара
  const handleRemoveItem = async (itemKey) => {
    setIsUpdating(true);
    try {
      const RemoveFromCart = api.removeItemsFromCart();
      const { data } = await client.mutate({
        mutation: RemoveFromCart,
        variables: {
          input: { keys: [itemKey] },
        },
      });

      if (data?.removeItemsFromCart?.cart) {
        updateCart(data.removeItemsFromCart.cart);
        removeItem(itemKey);
      }

      await cartQuery.refetch();
    } catch (err) {
      console.error("❌ Ошибка при удалении товара:", err);
      alert("❌ Ошибка при удалении товара из корзины");
    } finally {
      setIsUpdating(false);
    }
  };

  // Очистка корзины
  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      const EmptyCart = api.emptyCart();
      const { data } = await client.mutate({
        mutation: EmptyCart,
      });

      if (data?.emptyCart?.cart) {
        updateCart(data.emptyCart.cart);
        clearCart();
      }

      await cartQuery.refetch();
    } catch (err) {
      console.error("❌ Ошибка при очистке корзины:", err);
      alert("❌ Ошибка при очистке корзины");
    } finally {
      setIsClearing(false);
    }
  };

  return {
    cartQuery,
    graphQLCart,
    cartItems,
    shippingMethods,
    paymentMethods,
    baseTotal,
    finalTotal,
    isUpdating,
    isClearing,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
  };
};
