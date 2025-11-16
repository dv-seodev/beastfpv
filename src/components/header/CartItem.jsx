// components/CartIcon.js
'use client';
import { useCartStore } from '../../stores/cartStore';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const CartIcon = () => {
    const totalItems = useCartStore((state) => state.totalItems());
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // На сервере рендерим только иконку без бейджа
    if (!isMounted) {
        return (
            <Link href="/cart" className="icon-action cart-icon">
                <img src="/icons-header/basket.svg" alt="cart" />
            </Link>
        );
    }

    // На клиенте рендерим с бейджем
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
}

export default CartIcon;