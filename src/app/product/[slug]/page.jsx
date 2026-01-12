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
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const router = useRouter();

    const { addCartProduct, formatPrice } = useProductsList();

    const { addItem: addToFavorites, removeItem: removeFromFavorites, isInFavorites } = useFavoriteStore;

    const { updateQuantity, getItemQuantity, removeFromCart, updateCart } = useCartStore();

    const params = useParams();
    const slug = params.slug;

    const { data: product, loading, error } = useProductData(slug);
    const { data: homeData, loading: homeLoading, error: homeError } = useHomeData();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // ✅ ПРОВЕРКА НАЛИЧИЯ ТОВАРА В КОРЗИНЕ ПРИ МОНТИРОВАНИИ
    useEffect(() => {
        if (isMounted && product?.id) {
            const cartState = useCartStore.getState();
            const cartItems = cartState.items;

            const foundItem = cartItems.find(item =>
                item.product?.node?.id === product.id ||
                item.id === product.databaseId ||
                item.id === product.id
            );

            const itemQuantity = foundItem?.quantity || 0;
            setIsInCart(itemQuantity > 0);
            setQuantity(itemQuantity > 0 ? itemQuantity : 1);

            console.log(`📦 Товар ${product.name} в корзине:`, itemQuantity > 0);
        }
    }, [isMounted, product?.id, product?.name]);

    // ✅ ПОДПИСКА НА ИЗМЕНЕНИЯ КОРЗИНЫ
    useEffect(() => {
        if (!isMounted || !product?.id) return;

        const unsubscribe = useCartStore.subscribe(
            (state) => state.items,
            (items) => {
                const foundItem = items.find(item =>
                    item.product?.node?.id === product.id ||
                    item.id === product.databaseId ||
                    item.id === product.id
                );

                const itemQuantity = foundItem?.quantity || 0;
                setIsInCart(itemQuantity > 0);
                setQuantity(itemQuantity > 0 ? itemQuantity : 1);

                console.log(`🛒 Товар ${product.name} в корзине (обновлено):`, itemQuantity > 0);
            }
        );

        return () => unsubscribe();
    }, [isMounted, product?.id, product?.databaseId, product?.name]);

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

    if (loading || homeLoading) return <div>Загрузка...</div>;
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

    // ✅ ДОБАВЛЕНИЕ ТОВАРА В КОРЗИНУ
    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);
            console.log(`📦 Добавляем товар ${product.name} в корзину`);

            const Add2Cart = api.AddToCart();
            await client.mutate({
                mutation: Add2Cart,
                variables: {
                    input: {
                        productId: product.databaseId,
                        quantity: 1,
                    }
                }
            });

            const GetCart = api.getCart();
            const { data: cartData } = await client.query({
                query: GetCart,
            });

            if (cartData?.cart) {
                updateCart(cartData.cart);
                setIsInCart(true);
                setQuantity(1);
                console.log("✅ Товар успешно добавлен в корзину");
            }
        } catch (err) {
            console.error("❌ Ошибка при добавлении в корзину:", err);
            alert('❌ Ошибка при добавлении товара в корзину');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleGoToCart = () => {
        router.push('/cart/');
    };

    // ✅ ПОЛУЧЕНИЕ АКТУАЛЬНОГО ТОВАРА ИЗ КОРЗИНЫ
    const getCartItemForProduct = () => {
        const cartState = useCartStore.getState();
        const cartItems = cartState.items;

        return cartItems.find(item =>
            item.product?.node?.id === product.id ||
            item.id === product.databaseId ||
            item.id === product.id
        );
    };

    // ✅ УВЕЛИЧЕНИЕ КОЛИЧЕСТВА
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

            console.log('🔑 Key товара:', cartItem.key);

            const UpdateQuantity = api.updateItemQuantities();
            const { data: updateData } = await client.mutate({
                mutation: UpdateQuantity,
                variables: {
                    input: {
                        items: [
                            {
                                key: cartItem.key,
                                quantity: newQuantity,
                            }
                        ]
                    }
                }
            });

            console.log('✅ Результат обновления:', updateData);

            if (updateData?.updateItemQuantities?.cart) {
                updateCart(updateData.updateItemQuantities.cart);
                console.log("✅ Количество обновлено");
            }
        } catch (err) {
            console.error("❌ Ошибка при увеличении количества:", err);
            setQuantity(quantity);
            alert('❌ Ошибка при изменении количества');
        } finally {
            setIsUpdating(false);
        }
    };

    // ✅ УМЕНЬШЕНИЕ КОЛИЧЕСТВА
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

                console.log('🔑 Key товара:', cartItem.key);

                const UpdateQuantity = api.updateItemQuantities();
                const { data: updateData } = await client.mutate({
                    mutation: UpdateQuantity,
                    variables: {
                        input: {
                            items: [
                                {
                                    key: cartItem.key,
                                    quantity: newQuantity,
                                }
                            ]
                        }
                    }
                });

                console.log('✅ Результат обновления:', updateData);

                if (updateData?.updateItemQuantities?.cart) {
                    updateCart(updateData.updateItemQuantities.cart);
                    console.log("✅ Количество обновлено");
                }
            } catch (err) {
                console.error("❌ Ошибка при уменьшении количества:", err);
                setQuantity(quantity);
                alert('❌ Ошибка при изменении количества');
            } finally {
                setIsUpdating(false);
            }
        } else if (quantity === 1) {
            // ✅ ЕСЛИ КОЛИЧЕСТВО 1, УДАЛЯЕМ ТОВАР
            await handleRemoveFromCart();
        }
    };

    // ✅ УДАЛЕНИЕ ТОВАРА ИЗ КОРЗИНЫ
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

            const RemoveFromCart = api.removeItemsFromCart();
            const { data: removeData } = await client.mutate({
                mutation: RemoveFromCart,
                variables: {
                    input: {
                        keys: [cartItem.key]
                    }
                }
            });

            console.log('✅ Результат удаления:', removeData);

            const GetCart = api.getCart();
            const { data: cartData } = await client.query({
                query: GetCart,
            });

            if (cartData?.cart) {
                updateCart(cartData.cart);
                setIsInCart(false);
                setQuantity(1);
                console.log("✅ Товар удален из корзины");
            }
        } catch (err) {
            console.error("❌ Ошибка при удалении товара:", err);

            // ✅ FALLBACK: получаем свежие данные корзины при ошибке
            try {
                console.log('🔄 Получаем свежие данные корзины...');
                const GetCart = api.getCart();
                const { data: cartData } = await client.query({
                    query: GetCart,
                });

                if (cartData?.cart) {
                    updateCart(cartData.cart);

                    // Проверяем, есть ли товар в обновленной корзине
                    const stillInCart = cartData.cart.contents?.nodes?.some(node =>
                        node.product?.node?.id === product.id ||
                        node.key === product.id
                    );

                    setIsInCart(stillInCart || false);
                    setQuantity(1);

                    if (stillInCart) {
                        console.log('⚠️ Товар всё ещё в корзине');
                    } else {
                        console.log('✅ Товар успешно удален');
                    }
                }
            } catch (refreshErr) {
                console.error("❌ Ошибка при обновлении корзины:", refreshErr);
                alert('❌ Ошибка при удалении товара');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    // ✅ ИЗМЕНЕНИЕ КОЛИЧЕСТВА ПРИ ВВОДЕ
    const handleQuantityChange = async (e) => {
        const value = parseInt(e.target.value) || 0;

        if (value < 1) {
            // Если ввели 0 или меньше, не меняем
            return;
        }

        if (value === quantity) {
            // Если количество не изменилось, не делаем запрос
            return;
        }

        setQuantity(value);
        setIsUpdating(true);

        try {
            console.log(`📦 Меняем количество товара ${product.name} на ${value}`);

            const cartItem = getCartItemForProduct();

            if (!cartItem?.key) {
                console.warn('⚠️ Товар не найден в корзине');
                setQuantity(quantity);
                setIsUpdating(false);
                return;
            }

            console.log('🔑 Key товара:', cartItem.key);

            const UpdateQuantity = api.updateItemQuantities();
            const { data: updateData } = await client.mutate({
                mutation: UpdateQuantity,
                variables: {
                    input: {
                        items: [
                            {
                                key: cartItem.key,
                                quantity: value,
                            }
                        ]
                    }
                }
            });

            console.log('✅ Результат обновления:', updateData);

            if (updateData?.updateItemQuantities?.cart) {
                updateCart(updateData.updateItemQuantities.cart);
                console.log("✅ Количество обновлено");
            }
        } catch (err) {
            console.error("❌ Ошибка при изменении количества:", err);
            setQuantity(quantity);
            alert('❌ Ошибка при изменении количества');
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
