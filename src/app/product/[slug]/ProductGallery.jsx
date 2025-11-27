'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Thumbs } from "swiper/modules";

const ProductGallery = ({ galleryImages, productName, productImage }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    // Проверяем, что компонент смонтирован на клиенте
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="product-card__image-wrapper">
                <div style={{
                    width: '100%',
                    paddingBottom: '100%',
                    background: '#f0f0f0',
                    position: 'relative'
                }}>
                    <img
                        src={productImage || "/images/product_image.jpg"}
                        alt={productName}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
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
                {galleryImages && galleryImages.length > 0 ? (
                    galleryImages.map((image, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={image.sourceUrl}
                                alt={image.altText || productName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </SwiperSlide>
                    ))
                ) : (
                    <SwiperSlide>
                        <img
                            src={productImage || "/images/product_image.jpg"}
                            alt={productName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </SwiperSlide>
                )}
            </Swiper>

            {galleryImages && galleryImages.length > 1 && (
                <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={Math.min(5, galleryImages.length)}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[Navigation, Thumbs]}
                    className="mySwiper"
                >
                    {galleryImages.map((image, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={image.sourceUrl}
                                alt={image.altText || productName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    );
};

export default ProductGallery;