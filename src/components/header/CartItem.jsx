'use client';
import { useCartStore } from '../../stores/cartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useQuery } from '@apollo/client';
import client from '../../lib/ApolloClient';

const CartIcon = () => {
    const [isMounted, setIsMounted] = useState(false);

    // ТОТ ЖЕ query что и в Cart странице
    const allMethodsQuery = api.getCart();
    const { data: cartData, loading: cartLoading, refetch } = useQuery(allMethodsQuery, {
        errorPolicy: 'all',
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true, // ✅ Важно для обновлений
    });

    // Подписка на изменения корзины через глобальное событие
    useEffect(() => {
        const handleCartUpdate = () => {
            refetch(); // ✅ Перезагружаем данные при любом изменении
        };

        // Слушаем события от всех мутаций корзины
        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('cartItemChanged', handleCartUpdate);
        window.addEventListener('cartCleared', handleCartUpdate);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('cartItemChanged', handleCartUpdate);
            window.removeEventListener('cartCleared', handleCartUpdate);
        };
    }, [refetch]);

    // Подсчет общего количества товаров
    const getTotalItems = () => {
        if (cartData?.cart?.contents?.nodes) {
            return cartData.cart.contents.nodes.reduce((sum, node) => {
                return sum + (node.quantity || 0);
            }, 0);
        }
        // Fallback на локальный стор
        return useCartStore.getState().totalItems?.() || 0;
    };

    const totalItems = getTotalItems();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || cartLoading) {
        return (
            <Link href="/cart" className="icon-action cart-icon">
                <img src="/icons-header/basket.svg" alt="cart" />
            </Link>
        );
    }

    return (
        <Link href="/cart" className="icon-action cart-icon">
            <img src="/icons-header/basket.svg" alt="cart" />
            {totalItems > 0 && (
                <span className="cart-icon__badge">
                    {totalItems}
                </span>
            )}
        </Link>
    );
};

export default CartIcon;
