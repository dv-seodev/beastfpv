
'use client';

import Link from "next/link";
import './page.scss';
import NewItems from "../../../components/New_items";
import Breadcrumbs from "../../category/[[...slug]]/Breadcrumbs";
import React, { useRef, useState } from "react";
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

const Product_cart = () => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const { addCartProduct, formatPrice } = useProductsList();

    // Получаем slug из URL
    const params = useParams();
    const slug = params.slug;

    // Получаем данные товара через контроллер

    const { data: product, loading, error } = useProductData(slug);
    const { data: homeData, loading: homeLoading, error: homeError } = useHomeData();

    // 2. После ВСЕХ хуков можно делать условия
    if (loading || homeLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка товара: {error.message}</div>;
    if (homeError) return <div>Ошибка данных: {homeError.message}</div>;
    if (!product) return <div>Товар не найден</div>;
    if (!homeData) return <div>Данные не найдены</div>;

    const { new_products, pop_products, cats_list } = homeData;

    return (
        <section className="product-card">
            <div className="container product-card__container">
                <Breadcrumbs categories={product.categories} productName={product.name} />
                <div className="product-card__main">
                    <div className="product-card__image-wrapper">
                        <Swiper
                            style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' }}
                            spaceBetween={10}
                            navigation={false}
                            loop={true}
                            thumbs={{ swiper: thumbsSwiper }}
                            modules={[Navigation, Thumbs]}
                            className="mySwiper2"
                        >
                            {/* Динамические изображения из данных товара */}
                            {product.galleryImages.length > 0 ? (
                                product.galleryImages.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <img src={image.sourceUrl} alt={image.altText || product.name} />
                                    </SwiperSlide>
                                ))
                            ) : (
                                <SwiperSlide>
                                    <img src={product.image?.sourceUrl || "/images/product_image.jpg"} alt={product.name} />
                                </SwiperSlide>
                            )}
                        </Swiper>

                        {/* Миниатюры если есть дополнительные изображения */}
                        {product.galleryImages.length > 1 && (
                            <Swiper
                                onSwiper={setThumbsSwiper}
                                spaceBetween={10}
                                slidesPerView={Math.min(5, product.galleryImages.length)}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[Navigation, Thumbs]}
                                className="mySwiper"
                            >
                                {product.galleryImages.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <img src={image.sourceUrl} alt={image.altText || product.name} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                    <div className="product-card__descr">
                        <div className="product-card__descr-art">Артикул: {product.sku || '123124'}</div>
                        <div className="product-card__descr-main">{product.name}</div>
                        <div className="product-card__descr-rating">
                            <div className="product-card__descr-rating">
                                <div className="product-card__descr-rating-stars">

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
                        <button className="product-card__order-button button">Купить</button>
                        <div className="product-card__incart-wrapper">
                            <button className="product-card__order-button-incart button">Товар в корзине</button>
                            <div className="product-card__product-quantity">
                                <button className="button product-card__product-minus">
                                    <img src="/images/minus.svg" />
                                </button>
                                <input className="product-card__product-count" placeholder="1" />
                                <button className="button product-card__product-plus">
                                    <img src="/images/plus.svg" />
                                </button>
                            </div>
                        </div>
                        <div className="product-card__descr-favourite"><Link className="product-card__descr-favourite-icon" href="/"><img src="/images/favorites.svg" alt="add to favourite" /></Link><Link className="product-card__descr-favourite-name" href="/">Добавить в избранное</Link></div>
                        <div className="product-card__descr-char">
                            <div className="char-row"><div className="char-name">Рама</div><div className="char-value">Карбон</div></div>
                            <div className="char-row"><div className="char-name">Полетный контроллекр / Стек</div><div className="char-value">BEASTFPV F722 BLS 80A FC&ESC Stack</div></div>
                            <div className="char-row"><div className="char-name">Видеопередатчик на выбор</div><div className="char-value">BEASTFPV 3.3GHz 3,5W // 4.9 или 5.8GHz 5W // 1.2GHz 2W</div></div>
                            <div className="char-row"><div className="char-name">Приемник управления</div><div className="char-value">BEASTFPV ELRS 720MHz</div></div>
                            <div className="char-row"><div className="char-name">Моторы</div><div className="char-value">BEASTFPV 4216 550KV</div></div>
                            <div className="char-row"><div className="char-name">Камера</div><div className="char-value">T384, 384x288 пикс, 50 fps, 50 mK, 8~14 мкм</div></div>
                        </div>
                        <div className="product-card__descr-complect">
                            <h3>Комплектация</h3>
                            <div className="complect-name">Видеопередатчик: ELRS 2100Mhz RX</div>
                            <div className="complect-items complect-video">
                                <button defaultChecked><img src="/images/product_image.jpg" /></button>
                                <button><img src="/images/product_image.jpg" /></button>
                                <button><img src="/images/product_image.jpg" /></button>
                            </div>

                            <div className="complect-name">Приемник управления: ELRS 2100Mhz RX</div>
                            <div className="complect-items complect-reciever">
                                <button defaultChecked><img src="/images/product_image.jpg" /></button>
                                <button><img src="/images/product_image.jpg" /></button>
                                <button><img src="/images/product_image.jpg" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs />

            </div >
            <NewItems products={new_products} />
        </section >
    );
}

export default Product_cart;
