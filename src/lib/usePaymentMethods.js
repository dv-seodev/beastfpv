"use client";

import api from "./api";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

/**
 * Хук для получения методов оплаты
 * @returns {Object} { methods, loading, error }
 */
export const usePaymentMethods = () => {
  const paymentParams = api.fetchPaymentMethods();
  const { data, loading, error } = useQuery(paymentParams, {
    errorPolicy: "all",
  });

  const methods = useMemo(() => {
    const list = Array.isArray(data?.paymentGateways?.nodes)
      ? data.paymentGateways.nodes.map((node) => ({
          id: node.id,
          title: node.title,
          description: node.description,
        }))
      : [];

    // Гарантируем наличие COD даже если gateway временно не вернулся в GQL.
    if (!list.some((method) => method.id === "cod")) {
      list.push({
        id: "cod",
        title: "Оплата наличными при получении",
        description: "",
      });
    }

    return list;
  }, [data]);

  return {
    methods,
    loading,
    error,
  };
};
