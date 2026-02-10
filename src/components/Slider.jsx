'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './Slider.scss';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Link from 'next/link';

const SwipeSlider = () => {
    return (
        <section className="swiper">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                slidesPerView={1.2}
                centeredSlides={true}
                loop={false}
                initialSlide={1}
                spaceBetween={10}
                navigation={{ enabled: true }}
                pagination={{ clickable: true }}
                breakpoints={{
                    1200: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                        initialSlide: 1,
                        loop: true,
                        navigation: {
                            enabled: true,
                        },
                    },
                }}
            >
                <SwiperSlide className="swiper__slide" style={{ backgroundImage: 'url("/slider/Banner 5.jpg")' }}>
                    <div className="container swiper__container">
                        <div className="swiper__promo-text">Флагманские дроны<br />ЗВЕРОБОЙ</div>
                        <p className="swiper__header">C БОЛЬШОЙ ГРУЗОПОДЪЕМНОСТЬЮ</p>
                        <p className="swiper__promo-after">- Простые решения для сложных задач<br />- Грузоподъемность до 10кг</p>
                        <Link className="banner-link" href="/category/fpv/">Дроны</Link>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="swiper__slide" style={{ backgroundImage: 'url("/slider/Banner 1.jpg")' }}>
                    <div className="container swiper__container">
                        <div className="swiper__promo-text">СТАБИЛЬНЫЕ<br />СИСТЕМЫ СВЯЗИ</div>
                        <p className="swiper__header">370MHz / 720MHz / 915MHz / 2100MHz</p>
                        <p className="swiper__promo-after">- Безотказное и стабильное соединение<br />- Дальность до 60 k</p>
                        <Link className="banner-link" href="/category/accessory/moduli-dlya-fpv-dronov/">ПЕРЕДАТЧИКИ УПРАВЛЕНИЯ</Link>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="swiper__slide" style={{ backgroundImage: 'url("/slider/Banner 2.jpg")' }}>
                    <div className="container swiper__container">
                        <div className="swiper__promo-text">ПРОВЕРЕННЫЕ<br />ДВИГАТЕЛИ FPV</div>
                        <p className="swiper__header">2807 / 2812 / 3115 / 4216 / 4219</p>
                        <p className="swiper__promo-after">- Надёжность, проверенная временем<br />- Сделано в России</p>
                        <Link className="banner-link" href="/category/accessory/motory-dlya-fpv-dronov/">МОТОРЫ</Link>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="swiper__slide" style={{ backgroundImage: 'url("/slider/Banner 3.jpg")' }}>
                    <div className="container swiper__container">
                        <div className="swiper__promo-text">BEASTFPV<br />ВИДЕОПЕРЕДАТЧИКИ</div>
                        <p className="swiper__header">1.2-1.4GH / 3.3GH / 4.9-6.1GHZ</p>
                        <p className="swiper__promo-after">- Настройка сетки каналов с шагов в 1МГц<br />- Мощность от 250mW до 10W</p>
                        <Link className="banner-link" href="/category/accessory/videoperedatchiki-dlya-fpv-dronov/">ВИДЕОПЕРЕДАТЧИКИ</Link>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="swiper__slide" style={{ backgroundImage: 'url("/slider/Banner 4.jpg")' }}>
                    <div className="container swiper__container">
                        <div className="swiper__promo-text">ПОЛЕТНЫЕ<br />КОНТРОЛЛЕРЫ</div>
                        <p className="swiper__header">BEASTFPV F722</p>
                        <p className="swiper__promo-after">- Поддержка двух камер<br />- ESC до 120A 85</p>
                        <Link className="banner-link" href="/category/accessory/kontrollery-poleta-dlya-fpv/">ПОЛЁТНЫЕ КОНТРОЛЛЕРЫ</Link>
                    </div>
                </SwiperSlide>

            </Swiper>
        </section >
    );
};

export default SwipeSlider;