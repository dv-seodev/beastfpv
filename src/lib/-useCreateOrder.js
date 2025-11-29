"use client";

import { useMutation } from "@apollo/client";
import api from "./api";

export const useCreateOrder = () => {
    const [createOrderMutation, { loading, error }] = useMutation(
        api.createOrderMutation
    );

    const createOrder = async (orderData) => {
        try {
            // Подготавливаем данные в правильном формате для GraphQL
            const variables = {
                input: {
                    clientMutationId: "CreateOrder",
                    paymentMethod: orderData.paymentMethod || "bacs",
                    paymentMethodTitle: orderData.paymentMethodTitle || "Bank Transfer",
                    billing: {
                        firstName: orderData.billing.first_name,
                        lastName: orderData.billing.last_name,
                        address1: orderData.billing.address_1,
                        address2: orderData.billing.address_2,
                        city: orderData.billing.city,
                        state: orderData.billing.state || "RU",
                        postcode: orderData.billing.postcode,
                        country: orderData.billing.country || "RU",
                        email: orderData.billing.email,
                        phone: orderData.billing.phone,
                    },
                    shipping: {
                        firstName: orderData.shipping.first_name,
                        lastName: orderData.shipping.last_name,
                        address1: orderData.shipping.address_1,
                        address2: orderData.shipping.address_2,
                        city: orderData.shipping.city,
                        state: orderData.shipping.state || "RU",
                        postcode: orderData.shipping.postcode,
                        country: orderData.shipping.country || "RU",
                    },
                    lineItems: orderData.line_items.map(item => ({
                        productId: item.product_id,
                        quantity: item.quantity,
                    })),
                    shippingLines: orderData.shipping_lines?.map(line => ({
                        methodId: line.method_id,
                        methodTitle: line.method_title,
                        total: line.total || "0",
                    })) || [
                            {
                                methodId: "flat_rate",
                                methodTitle: "Flat Rate",
                                total: "0",
                            },
                        ],
                    status: "pending",
                },
            };

            console.log("Создаём заказ через GraphQL:", variables);

            const result = await createOrderMutation({
                variables,
            });

            if (result.data?.createOrder?.order) {
                return {
                    success: true,
                    orderId: result.data.createOrder.order.databaseId,
                    orderNumber: result.data.createOrder.order.orderNumber,
                    data: result.data.createOrder.order,
                };
            }

            throw new Error("No order data returned");
        } catch (err) {
            console.error("Ошибка создания заказа:", err);
            return {
                success: false,
                error: err.message,
            };
        }
    };

    return {
        createOrder,
        loading,
        error,
    };
};
