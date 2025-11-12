'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './Slider.scss';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
                <SwiperSlide className="swiper__slide">
                    <div className="container swiper__container">
                        <p className="swiper__header">F-10 Thermal 10-inch FPV</p>
                        <div className="swiper__promo-text">Контроллер F722<br />бесстрашен даже<br />в ночных полетах</div>
                        <p className="swiper__promo-after">Поддержка двух камер, в том числе с тепловизором,<br /> надежность, полностью собственная разработка, доступная цена</p>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="swiper__slide">
                    <div className="container swiper__container">
                        <p className="swiper__header">F-10 Thermal 10-inch FPV</p>
                        <div className="swiper__promo-text">Контроллер F722<br />бесстрашен даже<br />в ночных полетах</div>
                        <p className="swiper__promo-after">Поддержка двух камер, в том числе с тепловизором,<br /> надежность, полностью собственная разработка, доступная цена</p>
                    </div>
                </SwiperSlide>
                <SwiperSlide className="swiper__slide">
                    <div className="container swiper__container">
                        <p className="swiper__header">F-10 Thermal 10-inch FPV</p>
                        <div className="swiper__promo-text">Контроллер F722<br />бесстрашен даже<br />в ночных полетах</div>
                        <p className="swiper__promo-after">Поддержка двух камер, в том числе с тепловизором,<br /> надежность, полностью собственная разработка, доступная цена</p>
                    </div>
                </SwiperSlide>
            </Swiper>
        </section >
    );
};

export default SwipeSlider;