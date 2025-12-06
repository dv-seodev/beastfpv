import api from './api';
import { useQuery } from "@apollo/client/react";

export const useCategoryData = (slug) => {
    const catProductsQuery = useQuery(api.fetchProducts(13, slug));

    const isLoading = catProductsQuery.loading;
    const error = catProductsQuery.error;

    const data = !isLoading && !error ? {
        category: catProductsQuery.data?.productCategory || null, // добавляем категорию
        cat_products: catProductsQuery.data?.products?.nodes || []
    } : null;

    return { data, loading: isLoading, error };
};