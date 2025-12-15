'use client';

import api from './api';
import { useQuery } from "@apollo/client/react";

export const useShippingMethods = () => {
    const allMethodsQuery = api.fetchShippingMethods();
    const { data: allMethodsData, loading, error } = useQuery(allMethodsQuery, {
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    const defaultMethods = [
        {
            id: "c2hpcHBpbmdfbWV0aG9kOmxvY2FsX3BpY2t1cA==",
            databaseId: "local_pickup",
            label: "Самовывоз",
            title: "Самовывоз",
            cost: "0",
            description: "Позволить клиентам забирать заказы самостоятельно. По умолчанию, при использовании самовывоза, базовые налоги будут рассчитаны независимо от адреса пользователя."
        },
        {
            id: "c2hpcHBpbmdfbWV0aG9kOm9mZmljaWFsX2NkZWs=",
            databaseId: "official_cdek",
            label: "Доставка СДЭК",
            title: "Доставка до ПВЗ СДЭК",
            cost: "0",
            description: "Официальный метод доставки компанией СДЭК"
        }
    ];

    let methods = [];

    // Методы которые НЕ показываем
    const excludedMethods = ['flat_rate', 'free_shipping'];

    if (allMethodsData?.shippingMethods?.nodes) {
        methods = allMethodsData.shippingMethods.nodes
            .filter(method => {
                const hasTitle = method.title && method.title.trim().length > 0;
                const isNotExcluded = !excludedMethods.includes(method.databaseId);
                return hasTitle && isNotExcluded;
            })
            .map(method => ({
                id: method.id,
                databaseId: method.databaseId,
                label: method.title,
                title: method.title,
                cost: '0',
                description: method.description || 'Выберите способ доставки',
            }));
    }

    // Если нет методов с сервера - используем дефолты
    if (methods.length === 0) {
        methods = defaultMethods;
    }

    return {
        methods,
        loading,
        error,
    };
};
