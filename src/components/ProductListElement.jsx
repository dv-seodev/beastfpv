'use client';

import Link from "next/link";
import { useProductsList } from '../lib/ProductsListController';
import { useCartStore } from '../stores/cartStore';
import { useState, useEffect } from 'react';

function ProductListItem({ product, onAddCart }) {
    const { addCartProduct, formatPrice } = useProductsList();
    const { isInCart } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    // Проверяем hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Проверяем есть ли товар в корзине
    const inCart = isMounted ? isInCart(product.id) : false;

    // Используем изображение или плейсхолдер
    const imageUrl = product?.image?.sourceUrl || '/images/placeholder.jpg';

    return (
        <div key={product.id} className="new-items__item popular-products__item">
            <Link href={`/product/${product.slug}`}>
                <img
                    src={imageUrl}
                    alt={product.name}
                />
            </Link>

            <Link href={`/product/${product.slug}`}>
                <div className="new-items__name new-slider">
                    {product.name}
                </div>
            </Link>

            <div className="new-items__price-wrapper">
                <span className="new-items__price">
                    {formatPrice(product.price)}
                </span>
                <button
                    className={`new-items__cart-button button ${inCart ? 'in-cart' : ''}`}
                    onClick={() => onAddCart(product)}
                    type="button"
                    title={inCart ? 'Товар в корзине' : 'Добавить в корзину'}
                >
                </button>
            </div>

            <button
                className="new-items__one-click button"
                type="button"
            >
                Купить в один клик
            </button>
        </div>
    );
}

export default ProductListItem;
