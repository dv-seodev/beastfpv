'use client';

import Link from "next/link";
import './New_items.scss';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './Slider.scss';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { useProductsList } from '../lib/ProductsListController';

const NewItems = ({ products }) => {

    const { addCartProduct, formatPrice } = useProductsList();

    return (

        <section className="new-items">
            <div className="container new-items__container">
                <div className="new-items__header">
                    <h2>Новинки</h2>
                    <Link className="link__show-all desktop-show" href="/">
                        <span>Все новинки</span>
                    </Link>
                </div>
                <section className="swiper-new">
                    <Swiper className="swiper-new-products"
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
                                    <div className="new-items__item">
                                        <Link href={`/product/${product.slug}`}>
                                            <img src={product.image.sourceUrl} alt={product.name} />
                                        </Link>
                                        <Link href={`/product/${product.slug}`}><div className="new-items__name new-slider">{product.name}</div></Link>
                                        <div className="new-items__price-wrapper">
                                            <span className="new-items__price">{formatPrice(product.price)}</span>
                                            <button className="new-items__cart-button button" onClick={() => addCartProduct(product)}>
                                            </button>
                                        </div>
                                        <button className="new-items__one-click button">Купить в один клик</button>
                                    </div>

                                </div>
                            </SwiperSlide>
                        ))}

                    </Swiper>
                    {/* <div className="swiper-button-prev">
                        prev
                    </div>
                    <div className="swiper-button-next">
                        next
                    </div> */}
                </section >
                <div className="link__show-all mobile-show">
                    <Link href="/">
                        <span className="show-all">Все новинки</span>
                    </Link>
                </div>
            </div >
        </section >
    );
}

export default NewItems;