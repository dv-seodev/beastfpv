'use client';

import api from './api';
import { useQuery } from "@apollo/client/react";

/**
 * Хук для получения методов доставки
 * @returns {Object} { methods, loading, error }
 */
export const useShippingMethods = () => {
    const shippingParams = api.fetchShippingMethods();

    const { data, loading, error } = useQuery(
        shippingParams,
        {
            // fetchPolicy: 'cache-first',
        }
    );

    // Дефолтные методы доставки (если GraphQL не вернул)
    const defaultMethods = [
        { id: '1', title: 'Самовывоз', description: '+500₽' },
        { id: '2', title: 'Доставка до ПВЗ СДЭК', description: '+100₽' },
    ];

    // Получаем методы из GraphQL, если пусто — используем дефолты
    const methods = data?.shippingMethods?.nodes?.length > 0
        ? data.shippingMethods.nodes
        : defaultMethods;

    return {
        methods,
        loading,
        error,
    };
};