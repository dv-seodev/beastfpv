'use client';

import Link from "next/link";
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

const Product_cart = () => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isMounted, setIsMounted] = useState(false);

    const { addCartProduct, formatPrice } = useProductsList();

    // Подключаем store избранного
    const { addItem: addToFavorites, removeItem: removeFromFavorites, isInFavorites } = useFavoriteStore();

    // Подключаем store корзины
    const { addItem: addToCart, updateQuantity, getItemQuantity, removeItem: removeFromCart } = useCartStore();

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
    const isFavorite = isMounted ? isInFavorites(product.id) : false;

    // Хлебные крошки для страницы товара
    const breadcrumbPath = [
        { name: 'Главная', href: '/' },
        { name: 'Каталог', href: '/' },
        { name: product?.categories?.[0]?.name || 'Категория', href: `/category/${product?.categories?.[0]?.slug}` },
        { name: product?.name, href: null, isCurrent: true }
    ];

    const handleToggleFavorite = () => {
        if (isFavorite) {
            removeFromFavorites(product.id);
        } else {
            addToFavorites(product);
        }
    };

    // Добавление товара в корзину
    const handleAddToCart = () => {
        addToCart(product);
        setQuantity(1);
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
                        <div className="product-card__descr-rating">
                            <div className="product-card__descr-rating">
                                <div className="product-card__descr-rating-stars">
                                    {/* РЕЙТИНГ ЗВЁЗДЫ */}
                                    <div className="half-stars">
                                        <div className="rating-group">
                                            <input disabled defaultChecked name="hsr" value="0" type="radio" />
                                            <label className="hsr" htmlFor="hsr-05">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.4c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6V0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-05" value="0.5" type="radio" />
                                            <label htmlFor="hsr-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-10" value="1" type="radio" />
                                            <label className="hsr" htmlFor="hsr-15">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.4c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6V0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-15" value="1.5" type="radio" />
                                            <label htmlFor="hsr-20">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-20" value="2" type="radio" />
                                            <label className="hsr" htmlFor="hsr-25">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.4c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6V0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-25" value="2.5" type="radio" />
                                            <label htmlFor="hsr-30">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-30" value="3" type="radio" />
                                            <label className="hsr" htmlFor="hsr-35">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.4c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6V0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-35" value="3.5" type="radio" />
                                            <label htmlFor="hsr-40">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-40" value="4" type="radio" />
                                            <label className="hsr" htmlFor="hsr-45">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.4c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6V0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-45" value="4.5" type="radio" />
                                            <label htmlFor="hsr-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" /></svg>
                                            </label>
                                            <input name="hsr" id="hsr-50" value="5" type="radio" />
                                        </div>
                                    </div>
                                </div>
                                <div className="product-card__descr-rating-value">4.5</div>
                                <div className="product-card__descr-rating-review"><Link href="/">Оставить отзыв</Link></div>
                            </div>
                        </div>

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

                        {/* КНОПКА КУПИТЬ */}
                        {!isInCart ? (
                            <button
                                className="product-card__order-button button"
                                onClick={handleAddToCart}
                            >
                                Купить
                            </button>
                        ) : (
                            <div className="product-card__incart-wrapper">
                                <button className="product-card__order-button-incart button" disabled>
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
                        <div className="product-card__descr-char">
                            <div className="char-row"><div className="char-name">Рама</div><div className="char-value">Карбон</div></div>
                            <div className="char-row"><div className="char-name">Полетный контроллекр / Стек</div><div className="char-value">BEASTFPV F722 BLS 80A FC&ESC Stack</div></div>
                            <div className="char-row"><div className="char-name">Видеопередатчик на выбор</div><div className="char-value">BEASTFPV 3.3GHz 3,5W // 4.9 или 5.8GHz 5W // 1.2GHz 2W</div></div>
                            <div className="char-row"><div className="char-name">Приемник управления</div><div className="char-value">BEASTFPV ELRS 720MHz</div></div>
                            <div className="char-row"><div className="char-name">Моторы</div><div className="char-value">BEASTFPV 4216 550KV</div></div>
                            <div className="char-row"><div className="char-name">Камера</div><div className="char-value">T384, 384x288 пикс, 50 fps, 50 mK, 8~14 мкм</div></div>
                        </div>

                        {/* КОМПЛЕКТАЦИЯ */}
                        <div className="product-card__descr-complect">
                            <h3>Комплектация</h3>
                            <div className="complect-name">Видеопередатчик: ELRS 2100Mhz RX</div>
                            <div className="complect-items complect-video">
                                <button defaultChecked><img src="/images/product_image.jpg" alt="video" /></button>
                                <button><img src="/images/product_image.jpg" alt="video" /></button>
                                <button><img src="/images/product_image.jpg" alt="video" /></button>
                            </div>

                            <div className="complect-name">Приемник управления: ELRS 2100Mhz RX</div>
                            <div className="complect-items complect-reciever">
                                <button defaultChecked><img src="/images/product_image.jpg" alt="receiver" /></button>
                                <button><img src="/images/product_image.jpg" alt="receiver" /></button>
                                <button><img src="/images/product_image.jpg" alt="receiver" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs />
            </div>
            <NewItems products={new_products} />
        </section>
    );
}

export default Product_cart;
