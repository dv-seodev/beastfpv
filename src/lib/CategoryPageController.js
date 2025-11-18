import api from './api';
import { useQuery } from "@apollo/client/react";

export const useCategoryData = (slug) => {
    const catProductsQuery = useQuery(api.fetchProducts(12, slug));

    const isLoading = catProductsQuery.loading;
    const error = catProductsQuery.error;

    const data = !isLoading && !error ? {
        // Добавляем данные категории из ответа
        category: catProductsQuery.data?.productCategory || null,
        cat_products: catProductsQuery.data?.products?.nodes || []
    } : null;

    return { data, loading: isLoading, error };
};