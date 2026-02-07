'use client';

import Link from "next/link";
import './Popular_products.scss';
import { useState, useEffect } from 'react';
import { useRestCart } from '../lib/hooks/useRestCart';
import { useProductsList } from '../lib/ProductsListController';
import ProductListItem from "./ProductListElement";
import OneClickModal from "./OneClickModal";

const PopularProducts = ({ products }) => {
    const { formatPrice } = useProductsList();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreorder, setIsPreorder] = useState(false);

    // ✅ ИЗМЕНЕНИЕ: Получаем корзину из useRestCart
    const { cart, fetchCart } = useRestCart();

    // ✅ ИЗМЕНЕНИЕ: Загружаем корзину при монтировании компонента
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ✅ ИЗМЕНЕНИЕ: Вычисляем ID товаров в корзине один раз для всех ProductListItem
    // Это предотвращает множественные запросы в каждом компоненте
    const cartProductIds = new Set(
        (cart?.items || []).map(item => item.product_id || item.id)
    );

    // ✅ ИЗМЕНЕНИЕ: Удаляем handleAddCart (больше не нужен, логика в ProductListItem)
    const handleOneClick = (product, options = {}) => {
        setSelectedProduct(product);
        setIsPreorder(!!options.isPreorder);
        setIsModalOpen(true);
    };

    return (
        <>
            <section className="popular-products">
                <div className="container popular-products__container">
                    <div className="popular-products__header">
                        <h2>Популярные товары</h2>
                        <Link className="link__show-all desktop-show" href="/">
                            <span>Смотреть все</span>
                        </Link>
                    </div>
                    <div className="popular-products__items-grid">
                        {products.map((product) => (
                            <ProductListItem
                                product={product}
                                key={product.id}
                                // ✅ ИЗМЕНЕНИЕ: Пробрасываем вычисленный флаг isInCart
                                isInCart={cartProductIds.has(product.databaseId)}
                                onOneClick={handleOneClick}
                            />
                        ))}
                    </div>
                    <div className="link__show-all mobile-show">
                        <Link href="/">
                            <span className="show-all">Все популярные</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Одна модаль для всех товаров */}
            {selectedProduct && (
                <OneClickModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    isPreorder={isPreorder}
                />
            )}
        </>
    );
}

export default PopularProducts;
