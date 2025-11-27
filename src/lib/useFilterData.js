'use client';

import api from './api';
import { useQuery } from "@apollo/client/react";

/**
 * Хук для получения данных фильтра (категории и подкатегории)
 * @returns {Object} { categories, loading, error }
 */
export const useFilterData = () => {
    const { data, loading, error } = useQuery(api.fetchProductCategories(), {
        // fetchPolicy: 'cache-first',
    });

    const categories = data?.productCategories?.nodes
        ?.filter(cat => !cat.parent?.node) // Только категории без родителя
        .map(category => {
            // Получаем подкатегории из children
            const subcategories = category.children?.nodes?.map(child => ({
                id: child.databaseId,
                name: child.name,
                slug: child.slug,
            })) || [];

            return {
                id: category.databaseId,
                name: category.name,
                slug: category.slug,
                subcategories,
            };
        })
        .filter(cat => cat.name !== 'Misc' && cat.name !== 'Uncategorized') // Исключаем служебные
        || [];

    return {
        categories,
        loading,
        error,
    };
};