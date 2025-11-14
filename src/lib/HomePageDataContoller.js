import api from './api';
import { useQuery } from "@apollo/client/react";

export const useHomeData = () => {
    const newProductsQuery = useQuery(api.fetchProducts(10, '10-inch'));
    const popProductsQuery = useQuery(api.fetchProducts(8, 'akkumulyatory'));
    const categoriesQuery = useQuery(api.fetchCategories(12, 20));

    const isLoading = newProductsQuery.loading || popProductsQuery.loading || categoriesQuery.loading;
    const error = newProductsQuery.error || popProductsQuery.error || categoriesQuery.error;

    const data = !isLoading && !error ? {
        new_products: newProductsQuery.data?.products?.nodes || [],
        pop_products: popProductsQuery.data?.products?.nodes || [],
        cats_list: categoriesQuery.data?.productCategories?.nodes || []
    } : null;

    return { data, loading: isLoading, error };
};