import api from './api';
import { useQuery } from '@apollo/client/react';

const PAGE_SIZE = 18;

export const useCategoryData = (slug) => {
    const { data, loading, error } = useQuery(
        api.fetchProducts(200, slug), // берём "много", чтобы хватило
        {
            skip: !slug,
            notifyOnNetworkStatusChange: true,
        }
    );

    const category = data?.productCategory || null;
    const allProducts = data?.products?.nodes || [];
    const totalCount = category?.count || allProducts.length;

    return {
        data: category
            ? {
                category,
                allProducts,    // ВСЕ товары категории (по данным GraphQL)
                totalCount,
            }
            : null,
        loading,
        error,
        pageSize: PAGE_SIZE,
    };
};