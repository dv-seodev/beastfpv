'use client';

import api from './api';
import { useQuery } from "@apollo/client/react";

/**
 * Хук для получения методов оплаты
 * @returns {Object} { methods, loading, error }
 */
export const usePaymentMethods = () => {
    const paymentParams = api.fetchPaymentMethods();

    const { data, loading, error } = useQuery(
        paymentParams,
        {
            errorPolicy: 'all',
        }
    );

    // COD метод оплаты (наличные)
    const codMethod = {
        id: 'cod',
        title: 'Оплата наличными',
        description: 'Оплата наличными при самовывозе',
        __typename: 'PaymentGateway'
    };

    // Дефолтные методы оплаты
    const defaultMethods = [
        codMethod,
        { id: 'bacs', title: 'Оплата на расчетный счет', description: 'Оплата на расчетный счет' },
        { id: 'yookassa_widget', title: 'Онлайн-оплата Юкасса', description: 'Онлайн-оплата Юкасса' },
    ];

    let methods = [];

    if (data && data.paymentGateways && data.paymentGateways.nodes) {
        const nodes = data.paymentGateways.nodes;

        if (Array.isArray(nodes) && nodes.length > 0) {
            methods = [...nodes];
            const hasCod = methods.some(m => m.id === 'cod');

            if (!hasCod) {
                methods.unshift(codMethod);
            }
        } else if (!Array.isArray(nodes)) {
            const nodesArray = Array.from(nodes || []);
            if (nodesArray.length > 0) {
                methods = [...nodesArray];
                const hasCod = methods.some(m => m.id === 'cod');
                if (!hasCod) {
                    methods.unshift(codMethod);
                }
            } else {
                methods = defaultMethods;
            }
        } else {
            methods = defaultMethods;
        }
    } else if (error) {
        methods = defaultMethods;
    } else if (!loading) {
        methods = [];
    }

    return {
        methods,
        loading,
        error,
    };
};
