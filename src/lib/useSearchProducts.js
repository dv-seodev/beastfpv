'use client';

import { useState, useMemo } from 'react';
import api from './api';
import { useQuery } from "@apollo/client/react";

export const useSearchProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data, loading, error } = useQuery(
        api.fetchSearchingProducts()
    );

    const filteredProducts = useMemo(() => {
        if (!data?.products?.nodes || searchTerm.trim().length < 1) {
            return [];
        }

        const term = searchTerm.toLowerCase();
        return data.products.nodes.filter(product =>
            product.name.toLowerCase().includes(term)
        );
    }, [data, searchTerm]);

    const search = (term) => {
        setSearchTerm(term);
    };

    return {
        search,
        products: filteredProducts,
        loading,
        error,
    };
};