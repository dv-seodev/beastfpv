import { useState } from "react";
import client from "../ApolloClient";
import api from "../api";

/**
 * Хук для работы с купонами в корзине
 * @param {Object} cartQuery - Query объект из useQuery для обновления данных
 * @param {Object} graphQLCart - Данные корзины из GraphQL
 */
export const useCartCoupon = (cartQuery, graphQLCart) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasAppliedCoupon = graphQLCart?.appliedCoupons?.length > 0;

  // Применение купона
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Введите код купона");
      return;
    }

    setIsLoading(true);
    try {
      const ApplyCouponMutation = api.applyCouponMutation();
      await client.mutate({
        mutation: ApplyCouponMutation,
        variables: {
          input: { code: couponCode },
        },
      });

      setCouponMessage("✅ Купон применён");
      await cartQuery.refetch();
    } catch (err) {
      console.error("❌ Ошибка при применении купона:", err);
      setCouponMessage("❌ Неверный купон или купон не активен");
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление купона
  const removeCoupon = async () => {
    setIsLoading(true);
    try {
      const RemoveCouponMutation = api.removeCouponMutation();
      await client.mutate({
        mutation: RemoveCouponMutation,
        variables: {
          input: {
            codes: [graphQLCart?.appliedCoupons?.[0]?.code],
          },
        },
      });

      setCouponCode("");
      setCouponMessage("");
      await cartQuery.refetch();
    } catch (err) {
      console.error("❌ Ошибка при удалении купона:", err);
      alert("Ошибка при удалении купона");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    couponCode,
    setCouponCode,
    couponMessage,
    isLoading,
    hasAppliedCoupon,
    applyCoupon,
    removeCoupon,
  };
};
