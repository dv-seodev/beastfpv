import { useQuery } from "@apollo/client";
import api from "./api";
import client from "./ApolloClient";

/**
 * Хук для работы с GraphQL запросами корзины
 *
 * getCart() - реактивный хук useQuery (для использования в компонентах)
 * fetchCart() - прямой запрос client.query() (для использования в обработчиках событий)
 */
export const useCustomGql = () => {
  const getCartQuery = api.getCart();

  // Реактивный хук - для использования на верхнем уровне компонента
  const useCartQuery = (options = {}) => {
    return useQuery(getCartQuery, {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
      ...options,
    });
  };

  // Прямой запрос - для использования в обработчиках событий
  const fetchCart = async (options = {}) => {
    const { data } = await client.query({
      query: getCartQuery,
      fetchPolicy: options.fetchPolicy || "network-only",
      errorPolicy: options.errorPolicy || "all",
      ...options,
    });
    return { data };
  };

  return {
    useCartQuery, // Для реактивного использования (хук)
    fetchCart, // Для прямого запроса (по событию)
  };
};
