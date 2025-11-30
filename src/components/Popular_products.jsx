'use client';

import Link from "next/link";
import './Popular_products.scss';
import { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { useProductsList } from '../lib/ProductsListController';
import ProductListItem from "./ProductListElement";
import OneClickModal from "./OneClickModal";

const PopularProducts = ({ products }) => {
    const { addCartProduct, formatPrice } = useProductsList();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddCart = (product) => {
        addCartProduct(product);
    };

    const handleOneClick = (product) => {
        setSelectedProduct(product);
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
                                onAddCart={handleAddCart}
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
                />
            )}
        </>
    );
}

export default PopularProducts;
