'use client';

import Link from "next/link";
import './New_items.scss';
import { useState, useEffect } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './Slider.scss';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductListItem from "./ProductListElement";
import OneClickModal from "./OneClickModal";

// ✅ ИЗМЕНЕНИЕ: Используем новый useRestCart вместо старого useCartStore
import { useRestCart } from '../lib/hooks/useRestCart';
import { useProductsList } from '../lib/ProductsListController';

const NewItems = ({ products }) => {
    const { formatPrice } = useProductsList();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { cart } = useRestCart();

    // ✅ ИЗМЕНЕНИЕ: Вычисляем ID товаров в корзине один раз для всех ProductListItem
    // Это предотвращает множественные запросы в каждом компоненте
    const cartProductIds = new Set(
        (cart?.items || []).map(item => item.product_id || item.id)
    );

    // ✅ ИЗМЕНЕНИЕ: Удаляем handleAddCart (больше не нужен, логика в ProductListItem)
    const handleOneClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    return (
        <>
            <section className="new-items">
                <div className="container new-items__container">
                    <div className="new-items__header">
                        <h2>Новинки</h2>
                        <Link className="link__show-all desktop-show" href="/">
                            <span>Все новинки</span>
                        </Link>
                    </div>
                    <section className="swiper-new">
                        <Swiper
                            className="swiper-new-products"
                            modules={[Navigation, Pagination, Autoplay]}
                            slidesPerView={1.5}
                            centeredSlides={false}
                            loop={true}
                            initialSlide={0}
                            spaceBetween={20}
                            navigation={{ enabled: true }}
                            pagination={{ clickable: false }}
                            breakpoints={{
                                1200: {
                                    slidesPerView: 4,
                                    spaceBetween: 10,
                                    initialSlide: 0,
                                    loop: true,
                                    navigation: {
                                        enabled: true,
                                    },
                                },
                                500: {
                                    slidesPerView: 2,
                                },
                            }}
                        >
                            {products.map((product) => (
                                <SwiperSlide key={product.id} className="new-slider">
                                    <div className="new-items__items-grid">
                                        <ProductListItem
                                            product={product}
                                            // ✅ ИЗМЕНЕНИЕ: Пробрасываем вычисленный флаг isInCart
                                            isInCart={cartProductIds.has(product.databaseId)}
                                            onOneClick={handleOneClick}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </section>
                    <div className="link__show-all mobile-show">
                        <Link href="/">
                            <span className="show-all">Все новинки</span>
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

export default NewItems;