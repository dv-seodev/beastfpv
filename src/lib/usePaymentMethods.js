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

    // Дефолтные методы оплаты (если GraphQL не вернул)
    const defaultMethods = [
        { id: '1', title: 'Наличными', description: 'Наличный расчет' },
        { id: '2', title: 'Онлайн-оплата', description: 'Быстрая оплата через интернет-банк' },
        { id: '3', title: 'Выставить счет', description: 'Выставить счет' },
    ];

    // Получаем методы из GraphQL, если пусто — используем дефолты
    const methods = data?.paymentGateways?.nodes?.length > 0
        ? data.paymentGateways.nodes
        : defaultMethods;

    return {
        methods,
        loading,
        error,
    };
};