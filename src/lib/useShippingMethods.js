"use client";

import api from "./api";
import { useQuery } from "@apollo/client/react";

export const useShippingMethods = () => {
  let methods = [];

  const query = api.fetchShippingMethods();
  const { data, loading, error } = useQuery(query, {
    errorPolicy: "all",
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  console.log("[useShippingMethods =====>] data", data);

  return {
    methods,
    loading,
    error,
  };
};
