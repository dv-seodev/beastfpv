'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import './page.scss';
import NewItems from "../../../components/New_items";
import Breadcrumbs from "../../category/[[...slug]]/Breadcrumbs";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Thumbs } from "swiper/modules";
import Tabs from "./Tabs";
import { useProductData } from "../../../lib/ProductCartDataController";
import { useParams } from 'next/navigation';
import { useHomeData } from "../../../lib/HomePageDataContoller";
import { useProductsList } from '../../../lib/ProductsListController';
import { useFavoriteStore } from '../../../stores/favoriteStore';
import { useCartStore } from '../../../stores/cartStore';
import ProductGallery from "./ProductGallery";
import api from "../../../lib/api";
import { useQuery, useMutation } from "@apollo/client";
import client from "../../../lib/ApolloClient";

const Product_cart = () => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    const { addCartProduct, formatPrice } = useProductsList();

    // Подключаем store избранного
    const { addItem: addToFavorites, removeItem: removeFromFavorites, isInFavorites } = useFavoriteStore;

    // Подключаем store корзины
    const { updateQuantity, getItemQuantity, removeFromCart, updateCart } = useCartStore();

    const params = useParams();
    const slug = params.slug;

    const { data: product, loading, error } = useProductData(slug);
    const { data: homeData, loading: homeLoading, error: homeError } = useHomeData();

    // Проверяем hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Получаем количество товара из корзины
    const cartQuantity = isMounted ? getItemQuantity(product?.id) : 0;
    const isInCart = cartQuantity > 0;

    // Обновляем локальное количество когда меняется корзина
    useEffect(() => {
        if (isInCart) {
            setQuantity(cartQuantity);
        }
    }, [isInCart, cartQuantity]);

    if (loading || homeLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка товара: {error.message}</div>;
    if (homeError) return <div>Ошибка данных: {homeError.message}</div>;
    if (!product) return <div>Товар не найден</div>;
    if (!homeData) return <div>Данные не найдены</div>;

    const { new_products, pop_products, cats_list } = homeData;

    // Проверяем, в избранном ли товар
    const isFavorite = isMounted ? isInFavorites(product.databaseId) : false;
    console.log('товар может быть в избранном - ', isFavorite);

    // ✨ НОВАЯ ПРОВЕРКА: товар в наличии или нет
    const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK' || product.stockQuantity === 0;

    // Хлебные крошки для страницы товара
    const breadcrumbPath = [
        { name: 'Главная', href: '/' },
        { name: 'Каталог', href: '/' },
        { name: product?.categories?.[0]?.name || 'Категория', href: `/category/${product?.categories?.[0]?.slug}` },
        { name: product?.name, href: null, isCurrent: true }
    ];

    const handleToggleFavorite = () => {
        if (isFavorite) {
            removeFromFavorites(product.databaseId);
        } else {
            addToFavorites(product);
        }
    };

    // Добавление товара в корзину
    const handleAddToCart = async () => {
        const Add2Cart = api.AddToCart();
        const data2 = await client.mutate({
            mutation: Add2Cart,
            variables: {
                input: {
                    productId: product.databaseId,
                    quantity: 1,
                }
            }
        });
        const GetCart = api.getCart();
        const data3 = await client.query({
            query: GetCart,
        });
        console.log("data 3");
        console.log(data3.data.cart);
        const store = updateCart(data3.data.cart);
    };

    const handleGoToCart = () => {
        router.push('/cart/');
    };

    // Увеличение количества
    const handleIncreaseQuantity = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        updateQuantity(product.id, newQuantity);
    };

    // Уменьшение количества
    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            updateQuantity(product.id, newQuantity);
        } else {
            // Если количество 1, удаляем из корзины
            removeFromCart(product.id);
            setQuantity(0);
        }
    };

    // Обновление количества через инпут
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        if (value > 0) {
            setQuantity(value);
            updateQuantity(product.id, value);
        }
    };

    return (
        <section className="product-card">
            <div className="container product-card__container">
                <Breadcrumbs categoryPath={breadcrumbPath} />
                <div className="product-card__main">
                    {/* ГАЛЕРЕЯ ТОВАРА */}
                    <ProductGallery
                        galleryImages={product.galleryImages}
                        productName={product.name}
                        productImage={product.image?.sourceUrl}
                    />
                    <div className="product-card__descr">
                        <div className="product-card__descr-art">Артикул: {product.sku || '123124'}</div>
                        <div className="product-card__descr-main">{product.name}</div>

                        <div className="product-card__descr-price">
                            <span>Цена:</span>
                            <div className="price-action-wr">
                                <div className="price-wrapper">
                                    <div className="action-price">{formatPrice(product.price)}</div>
                                    {product.hasDiscount && (
                                        <div className="old-price">{formatPrice(product.regularPrice)}</div>
                                    )}
                                </div>
                                {product.hasDiscount && (
                                    <div className="price-action-percent">
                                        -{product.discountPercent}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ✨ НОВОЕ: ПРОВЕРКА НАЛИЧИЯ */}
                        {isOutOfStock ? (
                            // Товар закончился
                            <div className="product-card__out-of-stock">
                                <span className="product-card__out-of-stock-text">Временно нет в наличии</span>
                            </div>
                        ) : !isInCart ? (
                            // Кнопка "Купить" (если товара нет в корзине И он в наличии)
                            <button
                                className="product-card__order-button button"
                                onClick={handleAddToCart}
                            >
                                Купить
                            </button>
                        ) : (
                            // Товар в корзине (если товар в наличии)
                            <div className="product-card__incart-wrapper">
                                <button
                                    className="product-card__order-button-incart button"
                                    onClick={handleGoToCart}
                                >
                                    Товар в корзине
                                </button>
                                <div className="product-card__product-quantity">
                                    <button
                                        className="button product-card__product-minus"
                                        onClick={handleDecreaseQuantity}
                                    >
                                        <img src="/images/minus.svg" alt="minus" />
                                    </button>
                                    <input
                                        className="product-card__product-count"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                    />
                                    <button
                                        className="button product-card__product-plus"
                                        onClick={handleIncreaseQuantity}
                                    >
                                        <img src="/images/plus.svg" alt="plus" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ИЗБРАННОЕ */}
                        <div className="product-card__descr-favourite">
                            <button
                                className="product-card__descr-favourite-icon"
                                onClick={handleToggleFavorite}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                <img
                                    src="/images/favorites.svg"
                                    alt="add to favourite"
                                    style={{
                                        filter: isFavorite ? 'invert(24%) sepia(79%) saturate(1234%) hue-rotate(343deg) brightness(105%) contrast(97%)' : 'none',
                                    }}
                                />
                            </button>
                            <button
                                className="product-card__descr-favourite-name"
                                onClick={handleToggleFavorite}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isFavorite ? '#e74c3c' : '#333',
                                    textDecoration: 'none',
                                    fontSize: 'inherit',
                                    fontWeight: 'inherit',
                                    padding: 0,
                                }}
                            >
                                {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                            </button>
                        </div>

                        {/* ХАРАКТЕРИСТИКИ */}
                        {product.characteristics && product.characteristics.length > 0 ? (
                            <div className="product-card__descr-char">
                                {product.characteristics.map((char, idx) => (
                                    <div key={idx} className="char-row">
                                        <div className="char-name">
                                            {char.naimenovanie || char.name || char.label}
                                        </div>
                                        <div className="char-value">
                                            {char.znachenie || char.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : product.attributes && product.attributes.length > 0 ? (
                            <div className="product-card__descr-char">
                                {product.attributes.map((attr, idx) => (
                                    <div key={idx} className="char-row">
                                        <div className="char-name">{attr.name}</div>
                                        <div className="char-value">{attr.options?.join(', ') || '-'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {product && Object.keys(product).length > 0 && (
                    <Tabs product={product} />
                )}
            </div>
            <NewItems products={new_products} />
        </section>
    );
}

export default Product_cart;
