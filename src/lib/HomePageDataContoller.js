import api from './api';
import { useQuery } from "@apollo/client/react";

export const useHomeData = () => {
    const newProductsQuery = useQuery(api.fetchProducts(10, 'new'));
    const popProductsQuery = useQuery(api.fetchProducts(8, 'popular'));
    const categoriesQuery = useQuery(api.fetchCategories(100, 20));
    const categoriesFPV = useQuery(api.fetchCategories(100, 18));
    const categoriesApp = useQuery(api.fetchCategories(100, 92));
    const categoriesPit = useQuery(api.fetchCategories(100, 93));

    const isLoading = newProductsQuery.loading || popProductsQuery.loading || categoriesQuery.loading;
    const error = newProductsQuery.error || popProductsQuery.error || categoriesQuery.error;

    // Добавляем отладку
    console.log('Categories data:', categoriesQuery.data);
    console.log('Categories error:', categoriesQuery.error);
    console.log('Categories loading:', categoriesQuery.loading);

    const data = !isLoading && !error ? {
        new_products: newProductsQuery.data?.products?.nodes || [],
        pop_products: popProductsQuery.data?.products?.nodes || [],
        cats_list: categoriesQuery.data?.productCategories?.nodes || [],
        catsfpv_list: categoriesFPV.data?.productCategories?.nodes || [],
        catsapp_list: categoriesApp.data?.productCategories?.nodes || [],
        catspit_list: categoriesPit.data?.productCategories?.nodes || []
    } : null;

    return { data, loading: isLoading, error };
};
