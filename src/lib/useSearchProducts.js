'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import api from './api';
import { useLazyQuery } from "@apollo/client/react";

export const useSearchProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const fetchingRef = useRef(false);

    const [fetchAllProducts, { data, loading, error, fetchMore, called }] = useLazyQuery(
        api.fetchSearchingProducts(),
        {
            variables: { after: null },
            notifyOnNetworkStatusChange: true,
        }
    );

    useEffect(() => {
        if (!called || !data?.products) return;

        const nodes = data.products.nodes || [];
        if (nodes.length > 0) {
            setAllProducts((prev) => {
                const seen = new Set(prev.map((p) => p.databaseId || p.id));
                const merged = [...prev];
                nodes.forEach((node) => {
                    const key = node.databaseId || node.id;
                    if (!seen.has(key)) {
                        seen.add(key);
                        merged.push(node);
                    }
                });
                return merged;
            });
        }

        const pageInfo = data.products.pageInfo;
        if (pageInfo?.hasNextPage && pageInfo?.endCursor && !fetchingRef.current) {
            fetchingRef.current = true;
            fetchMore({
                variables: { after: pageInfo.endCursor },
                updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult?.products) return prev;
                    return {
                        ...prev,
                        products: {
                            ...fetchMoreResult.products,
                            nodes: [
                                ...(prev?.products?.nodes || []),
                                ...(fetchMoreResult.products.nodes || []),
                            ],
                        },
                    };
                },
            }).finally(() => {
                fetchingRef.current = false;
            });
        }
    }, [called, data, fetchMore]);

    useEffect(() => {
        if (allProducts.length > 0) {
            console.log('[search] total products loaded:', allProducts.length);
        }
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        if (allProducts.length === 0 || searchTerm.trim().length < 1) {
            return [];
        }

        const term = searchTerm.toLowerCase();
        return allProducts.filter(product =>
            product.name.toLowerCase().includes(term)
        );
    }, [allProducts, searchTerm]);

    const search = (term) => {
        setSearchTerm(term);
        if (term.trim().length >= 2 && !called) {
            console.log('[search] start fetching catalog...');
            fetchAllProducts();
        }
    };

    return {
        search,
        products: filteredProducts,
        loading,
        error,
    };
};
