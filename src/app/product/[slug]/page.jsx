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
// ✅ ИЗМЕНЕНИЕ: Заменяем старый useCartStore на новый useRestCart
import { useRestCart } from '../../../lib/hooks/useRestCart';
import ProductGallery from "./ProductGallery";
import api from "../../../lib/api";
import { useQuery, useMutation } from "@apollo/client";
import client from "../../../lib/ApolloClient";
import { useCustomGql } from "../../../lib/useCustomGql";
import restApi from "../../../lib/woo_rest_api/rest_api";
import Loader from "../../../components/Loader";
// ✅ ИЗМЕНЕНИЕ: Удаляем неиспользуемый импорт useRestCart (был дублирован)


const Product_cart = () => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const router = useRouter();

    // ✅ ИЗМЕНЕНИЕ: Используем новый useRestCart hook вместо старого useCartStore
    const {
        cart,
        fetchCart,
        handleQuantityChange,
        handleRemoveItem,
    } = useRestCart();

    const { addCartProduct, formatPrice } = useProductsList();

    // ✅ ИЗМЕНЕНИЕ: Используем только методы получения и удаления из избранного
    const { addItem: addToFavorites, removeItem: removeFromFavorites, isInFavorites } = useFavoriteStore;

    const params = useParams();
    const slug = params.slug;

    const { data: product, loading, error } = useProductData(slug);
    const { data: homeData, loading: homeLoading, error: homeError } = useHomeData();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ✅ ИЗМЕНЕНИЕ: Загружаем корзину при монтировании
    useEffect(() => {
        if (isMounted) {
            fetchCart();
        }
    }, [isMounted, fetchCart]);

    // ✅ ИЗМЕНЕНИЕ: Проверяем наличие товара в корзине через REST данные
    useEffect(() => {
        if (isMounted && product?.databaseId && cart?.items) {
            // Ищем товар в корзине по databaseId или id
            const foundItem = cart.items.find(item =>
                item.product_id === product.databaseId ||
                item.id === product.databaseId
            );

            const itemQuantity = foundItem?.quantity || 0;
            setIsInCart(itemQuantity > 0);
            setQuantity(itemQuantity > 0 ? itemQuantity : 1);

            console.log(`📦 Товар ${product.name} в корзине:`, itemQuantity > 0, 'количество:', itemQuantity);
        }
    }, [isMounted, product?.databaseId, product?.name, cart?.items]);

    // ✅ ИЗМЕНЕНИЕ: Подписываемся на изменения корзины через Zustand store
    useEffect(() => {
        if (!isMounted || !product?.databaseId) return;

        // Функция для обновления состояния товара в корзине
        const updateCartState = () => {
            const cartItems = useRestCart.getState().cart?.items || [];
            const foundItem = cartItems.find(item =>
                item.product_id === product.databaseId ||
                item.id === product.databaseId
            );

            const itemQuantity = foundItem?.quantity || 0;
            setIsInCart(itemQuantity > 0);
            setQuantity(itemQuantity > 0 ? itemQuantity : 1);

            console.log(`🛒 Товар ${product.name} в корзине (обновлено):`, itemQuantity > 0);
        };

        // Подписываемся на изменения состояния корзины
        const unsubscribe = useRestCart.subscribe(
            (state) => state.cart?.items,
            (items) => {
                updateCartState();
            }
        );

        return () => unsubscribe();
    }, [isMounted, product?.databaseId, product?.name]);

    // ✅ ИЗМЕНЕНИЕ: Используем существующую логику для избранного (без изменений)
    useEffect(() => {
        if (isMounted && product?.databaseId) {
            const favoriteStatus = isInFavorites(product.databaseId);
            setIsFavorite(favoriteStatus);

            const handleFavoritesUpdate = () => {
                setIsFavorite(isInFavorites(product.databaseId));
            };

            window.addEventListener('favoritesChanged', handleFavoritesUpdate);
            return () => window.removeEventListener('favoritesChanged', handleFavoritesUpdate);
        }
    }, [isMounted, product?.databaseId, isInFavorites]);

    if (loading || homeLoading) return <Loader label="Загружаем" />;
    if (error) return <div>Ошибка товара: {error.message}</div>;
    if (homeError) return <div>Ошибка данных: {homeError.message}</div>;
    if (!product) return <div>Товар не найден</div>;
    if (!homeData) return <div>Данные не найдены</div>;

    const { new_products, pop_products, cats_list } = homeData;

    const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK' || product.stockQuantity === 0;

    const breadcrumbPath = [
        { name: 'Главная', href: '/' },
        { name: 'Каталог', href: '/' },
        { name: product?.categories?.[0]?.name || 'Категория', href: `/category/${product?.categories?.[0]?.slug}` },
        { name: product?.name, href: null, isCurrent: true }
    ];

    const handleToggleFavorite = () => {
        if (isFavorite) {
            removeFromFavorites(product.databaseId);
            setIsFavorite(false);
        } else {
            addToFavorites(product);
            setIsFavorite(true);
        }
    };

    // ✅ ИЗМЕНЕНИЕ: Переделана функция добавления товара в корзину с использованием REST API
    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);

            // Добавляем товар в корзину через REST API
            const newCart = await restApi.addToCart({
                id: product.databaseId,
                quantity: 1,
            });

            // ✅ ИЗМЕНЕНИЕ: Обновляем состояние REST корзины вместо GraphQL
            useRestCart.getState().updateCart(newCart);

            // ✅ ИЗМЕНЕНИЕ: Устанавливаем количество = 1 (только что добавили)
            setQuantity(1);
            setIsInCart(true);

            console.log("✅ Товар успешно добавлен в корзину");
        } catch (err) {
            console.error("❌ Ошибка при добавлении в корзину:", err);
            alert("❌ Ошибка при добавлении товара в корзину");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleGoToCart = () => {
        router.push('/cart/');
    };

    // ✅ ИЗМЕНЕНИЕ: Получаем текущий товар из REST корзины
    const getCartItemForProduct = () => {
        const cartItems = useRestCart.getState().cart?.items || [];
        return cartItems.find(item =>
            item.product_id === product.databaseId ||
            item.id === product.databaseId
        );
    };

    // ✅ ИЗМЕНЕНИЕ: Переделана функция увеличения количества с использованием REST API
    const handleIncreaseQuantity = async () => {
        if (isUpdating) return;

        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        setIsUpdating(true);

        try {
            console.log(`📦 Увеличиваем количество товара ${product.name} на ${newQuantity}`);

            const cartItem = getCartItemForProduct();

            if (!cartItem?.key) {
                console.warn('⚠️ Товар не найден в корзине');
                setQuantity(quantity);
                setIsUpdating(false);
                return;
            }

            // ✅ ИЗМЕНЕНИЕ: Используем REST API для обновления количества
            await handleQuantityChange(cartItem.key, newQuantity);

            console.log("✅ Количество обновлено");
        } catch (err) {
            console.error("❌ Ошибка при увеличении количества:", err);
            setQuantity(quantity);
            alert('❌ Ошибка при изменении количества');
        } finally {
            setIsUpdating(false);
        }
    };

    // ✅ ИЗМЕНЕНИЕ: Переделана функция уменьшения количества с использованием REST API
    const handleDecreaseQuantity = async () => {
        if (isUpdating) return;

        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            setIsUpdating(true);

            try {
                console.log(`📦 Уменьшаем количество товара ${product.name} на ${newQuantity}`);

                const cartItem = getCartItemForProduct();

                if (!cartItem?.key) {
                    console.warn('⚠️ Товар не найден в корзине');
                    setQuantity(quantity);
                    setIsUpdating(false);
                    return;
                }

                // ✅ ИЗМЕНЕНИЕ: Используем REST API для обновления количества
                await handleQuantityChange(cartItem.key, newQuantity);

                console.log("✅ Количество обновлено");
            } catch (err) {
                console.error("❌ Ошибка при уменьшении количества:", err);
                setQuantity(quantity);
                alert('❌ Ошибка при изменении количества');
            } finally {
                setIsUpdating(false);
            }
        } else if (quantity === 1) {
            // ✅ ИЗМЕНЕНИЕ: Если количество 1, удаляем товар
            await handleRemoveFromCart();
        }
    };

    // ✅ ИЗМЕНЕНИЕ: Переделана функция удаления товара с использованием REST API
    const handleRemoveFromCart = async () => {
        if (isUpdating) return;

        setIsUpdating(true);

        try {
            console.log('🗑️ Удаляем товар из корзины');

            const cartItem = getCartItemForProduct();

            console.log('🔍 Найденный товар:', cartItem);

            if (!cartItem?.key) {
                console.warn('⚠️ Товар не найден в корзине или нет key');
                setIsInCart(false);
                setQuantity(1);
                setIsUpdating(false);
                return;
            }

            console.log('🗑️ Удаляем товар с key:', cartItem.key);

            // ✅ ИЗМЕНЕНИЕ: Используем REST API для удаления товара
            await handleRemoveItem(cartItem.key);

            setIsInCart(false);
            setQuantity(1);
            console.log("✅ Товар удален из корзины");
        } catch (err) {
            console.error("❌ Ошибка при удалении товара:", err);

            // ✅ ИЗМЕНЕНИЕ: FALLBACK - получаем свежие данные корзины при ошибке
            try {
                console.log('🔄 Получаем свежие данные корзины...');
                await fetchCart();

                const cartItems = useRestCart.getState().cart?.items || [];
                const stillInCart = cartItems.find(item =>
                    item.product_id === product.databaseId ||
                    item.id === product.databaseId
                );

                setIsInCart(!!stillInCart);
                setQuantity(1);

                if (stillInCart) {
                    console.log('⚠️ Товар всё ещё в корзине');
                } else {
                    console.log('✅ Товар успешно удален');
                }
            } catch (refreshErr) {
                console.error("❌ Ошибка при обновлении корзины:", refreshErr);
                alert('❌ Ошибка при удалении товара');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    console.log('DEBUG:', {
        'product.id': product?.id,
        'product.databaseId': product?.databaseId,
        'isInCart': isInCart,
        'quantity': quantity,
        'isUpdating': isUpdating,
        'cartItems': cart?.items?.length || 0,
    });

    return (
        <section className="product-card">
            <div className="container product-card__container">
                <Breadcrumbs categoryPath={breadcrumbPath} />
                <div className="product-card__main">
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

                        {/* ✅ ИЗМЕНЕНИЕ: Логика отображения кнопок теперь основана на REST корзине */}
                        {isOutOfStock ? (
                            <div className="product-card__out-of-stock">
                                <span className="product-card__out-of-stock-text">Временно нет в наличии</span>
                            </div>
                        ) : !isInCart ? (
                            <button
                                className="product-card__order-button button"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || isUpdating}
                                style={{
                                    opacity: (isAddingToCart || isUpdating) ? 0.6 : 1,
                                    cursor: (isAddingToCart || isUpdating) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isAddingToCart ? 'Добавляю...' : 'Купить'}
                            </button>
                        ) : (
                            <div className="product-card__incart-wrapper">
                                <button
                                    className="product-card__order-button-incart button"
                                    onClick={handleGoToCart}
                                    disabled={isUpdating}
                                >
                                    Товар в корзине
                                </button>
                                <div className="product-card__product-quantity">
                                    <button
                                        className="button product-card__product-minus"
                                        onClick={handleDecreaseQuantity}
                                        disabled={isUpdating}
                                        title={isUpdating ? "Обновление..." : "Уменьшить количество"}
                                    >
                                        <img src="/images/minus.svg" alt="minus" />
                                    </button>
                                    <input
                                        className="product-card__product-count"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        disabled={isUpdating}
                                    />
                                    <button
                                        className="button product-card__product-plus"
                                        onClick={handleIncreaseQuantity}
                                        disabled={isUpdating}
                                        title={isUpdating ? "Обновление..." : "Увеличить количество"}
                                    >
                                        <img src="/images/plus.svg" alt="plus" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="product-card__descr-favourite">
                            <button
                                className="product-card__descr-favourite-icon"
                                onClick={handleToggleFavorite}
                                disabled={isUpdating}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    padding: 0,
                                    opacity: isUpdating ? 0.6 : 1,
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
                                disabled={isUpdating}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    color: isFavorite ? '#e74c3c' : '#333',
                                    textDecoration: 'none',
                                    fontSize: 'inherit',
                                    fontWeight: 'inherit',
                                    padding: 0,
                                    opacity: isUpdating ? 0.6 : 1,
                                }}
                            >
                                {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                            </button>
                        </div>

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
};

export default Product_cart;