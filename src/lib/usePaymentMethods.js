"use client";

import api from "./api";
import { useQuery } from "@apollo/client/react";

/**
 * Хук для получения методов оплаты
 * @returns {Object} { methods, loading, error }
 */
export const usePaymentMethods = () => {
  let methods = [];

  const paymentParams = api.fetchPaymentMethods();
  const { data, loading, error } = useQuery(paymentParams, {
    errorPolicy: "all",
  });

  if (data && data.paymentGateways && data.paymentGateways.nodes) {
    methods = data.paymentGateways.nodes.map((node) => ({
      id: node.id,
      title: node.title,
      description: node.description,
    }));
  }

  // Лютый костыль
  if (!methods.some((m) => m.id === "cod")) {
    methods.push({
      id: "cod",
      title: "Оплата наличными при получении",
      description: "",
    });
  }

  return {
    methods,
    loading,
    error,
  };
};
