'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useCartStore } from "../../stores/cartStore";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { useQuery } from "@apollo/client";
import { formatPhoneNumber } from "../../lib/phoneMask";


const parsePrice = (priceString) => {
    if (!priceString) return 0;
    const noHtml = priceString.replace(/&nbsp;/g, ' ');
    const cleaned = noHtml.replace(/[^\d.,]/g, '');
    const noSpaces = cleaned.replace(/\s+/g, '');
    const normalized = noSpaces.replace(/,/g, '.');
    return parseFloat(normalized) || 0;
};


const formatPriceForDisplay = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
        return '0 ₽';
    }
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(price)) + ' ₽';
};


const Checkout = () => {
    const router = useRouter();
    const { data, loading, error } = useHomeData();

    const {
        items,
        selectedShipping,
        selectedPayment,
        clearCart,
    } = useCartStore();

    const [isHydrated, setIsHydrated] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        city: '',
        street: '',
        house: '',
        flat: '',
        index: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ ПРОВЕРКА ГИДРАЦИИ
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // ───── ПОЛУЧЕНИЕ ДАННЫХ КОРЗИНЫ ИЗ GRAPHQL ─────
    const allMethodsQuery = api.getCart();
    const data1 = useQuery(allMethodsQuery, {
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    console.log('📦 GraphQL Cart Data:', data1);

    const graphQLCart = data1?.data?.cart || null;
    const cartItems = graphQLCart?.contents?.nodes || [];

    console.log('🛒 Cart Items from GraphQL:', cartItems);

    // ✅ ПРЕОБРАЗОВАНИЕ МЕТОДОВ ДОСТАВКИ ИЗ GRAPHQL
    const graphQLShippingMethods = graphQLCart?.availableShippingMethods
        ?.flatMap(pkg => pkg.rates || [])
        .map(rate => ({
            id: rate.id,
            title: rate.label,
            cost: parsePrice(rate.cost),
        })) || [];

    // ✅ ПРЕОБРАЗОВАНИЕ МЕТОДОВ ОПЛАТЫ ИЗ GRAPHQL
    const graphQLPaymentMethods = data1?.data?.paymentGateways?.nodes?.map(gateway => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
    })) || [];

    // ✅ ПОЛУЧАЕМ ВЫБРАННЫЕ МЕТОДЫ ИЗ GRAPHQL
    const selectedShippingMethod = graphQLShippingMethods.find(m => m.id === selectedShipping);
    const selectedPaymentMethod = graphQLPaymentMethods.find(m => m.id === selectedPayment);

    // ✅ ПОЛУЧАЕМ СТОИМОСТЬ ИЗ ОБЪЕКТА КОРЗИНЫ
    const shippingCost = graphQLCart?.shippingTotal
        ? parsePrice(graphQLCart.shippingTotal)
        : selectedShippingMethod?.cost || 0;

    const baseTotal = graphQLCart?.subtotal
        ? parsePrice(graphQLCart.subtotal)
        : 0;

    const discountTotal = graphQLCart?.discountTotal
        ? parsePrice(graphQLCart.discountTotal)
        : 0;

    const finalTotal = graphQLCart?.total
        ? parsePrice(graphQLCart.total)
        : (baseTotal - discountTotal + shippingCost);

    // ✅ ОПРЕДЕЛЯЕМ САМОВЫВОЗ
    const isPickup = selectedShippingMethod?.id?.includes('pickup') ||
        selectedShippingMethod?.title?.toLowerCase().includes('самовывоз');

    console.log('Selected shipping method:', selectedShippingMethod);
    console.log('Selected payment method:', selectedPaymentMethod);
    console.log('Is pickup:', isPickup);
    console.log('Shipping cost:', shippingCost);
    console.log('Final total:', finalTotal);

    // ✅ ПОКАЗЫВАЕМ ЗАГРУЗКУ ПОКА ГИДРАЦИЯ НЕ ГОТОВА
    if (!isHydrated) {
        return (
            <section className="checkout">
                <div className="container checkout__container">
                    <h1 className="checkout__header">Оформление заказа</h1>
                    <div className="checkout__empty">
                        <p>Загрузка...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (loading || data1.loading) {
        return (
            <section className="checkout">
                <div className="container checkout__container">
                    <h1 className="checkout__header">Оформление заказа</h1>
                    <div className="checkout__empty">
                        <p>Загрузка...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error || data1.error) {
        return (
            <section className="checkout">
                <div className="container checkout__container">
                    <h1 className="checkout__header">Оформление заказа</h1>
                    <div className="checkout__empty">
                        <p>❌ Ошибка: {error?.message || data1.error?.message}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="checkout">
                <div className="container checkout__container">
                    <h1 className="checkout__header">Оформление заказа</h1>
                    <div className="checkout__empty">
                        <p>Нет данных</p>
                    </div>
                </div>
            </section>
        );
    }

    const { new_products } = data;

    // ✅ ПРОВЕРКА КОРЗИНЫ ПОСЛЕ ГИДРАЦИИ - ИСПОЛЬЗУЕМ GraphQL ДАННЫЕ
    if (isHydrated && cartItems.length === 0) {
        return (
            <section className="checkout">
                <div className="container checkout__container">
                    <h3 className="checkout__header">Ваша корзина пуста</h3>
                    <Link className="continue-buy" href="/cart/">Продолжить покупки</Link>
                </div>
            </section>
        );
    }

    // ───── ОБРАБОТЧИКИ ─────

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'phone') {
            newValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Валидация телефона
        if (formData.phone.length < 18) {
            alert('Пожалуйста, введите полный номер телефона');
            return;
        }

        // ✅ Валидация адреса для доставки (кроме самовывоза)
        if (!isPickup && (!formData.city || !formData.street || !formData.house || !formData.index)) {
            alert('Пожалуйста, заполните все поля адреса');
            return;
        }

        // ✅ Валидация товаров
        if (cartItems.length === 0) {
            alert('Ошибка: В корзине нет товаров');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('🔍 Товары из GraphQL:', cartItems);

            const orderData = {
                payment_method: selectedPayment || "bacs",
                payment_method_title: selectedPaymentMethod?.title || "Bank Transfer",
                billing: {
                    first_name: formData.name.split(' ')[0] || 'Customer',
                    last_name: formData.name.split(' ')[1] || '',
                    address_1: isPickup ? 'Самовывоз' : `${formData.street} ${formData.house}`,
                    address_2: isPickup ? '' : (formData.flat || ''),
                    city: isPickup ? 'Москва' : formData.city,
                    postcode: isPickup ? '' : formData.index,
                    country: 'RU',
                    state: 'RU',
                    email: formData.email || 'guest@example.com',
                    phone: formData.phone,
                },
                shipping: {
                    first_name: formData.name.split(' ')[0] || 'Customer',
                    last_name: formData.name.split(' ')[1] || '',
                    address_1: isPickup ? 'Самовывоз' : `${formData.street} ${formData.house}`,
                    address_2: isPickup ? '' : (formData.flat || ''),
                    city: isPickup ? 'Москва' : formData.city,
                    postcode: isPickup ? '' : formData.index,
                    country: 'RU',
                    state: 'RU',
                },
                // ✅ ИСПРАВЛЕННОЕ: Берём данные правильно из структуры GraphQL
                line_items: cartItems.map(item => {
                    // Товар находится в item.product.node
                    const product = item.product?.node;
                    const productId = product?.databaseId || null;
                    const quantity = item.quantity || 1;

                    console.log('🔍 Отправляем товар:', {
                        productName: product?.name,
                        productId: productId,
                        quantity: quantity,
                        price: product?.price,
                    });

                    if (!productId) {
                        console.warn('⚠️ Товар без ID:', item);
                    }

                    return {
                        product_id: productId,
                        quantity: quantity,
                    };
                }),
                shipping_lines: [
                    {
                        method_id: 'flat_rate',
                        method_title: selectedShippingMethod?.title || 'Flat Rate',
                        total: shippingCost.toString(),
                    },
                ],
            };

            console.log('📝 Создаём заказ:', orderData);
            console.log('📦 Line items для отправки:', orderData.line_items);

            const apiUrl = typeof window !== 'undefined'
                ? `${window.location.origin}/api/checkout`
                : 'http://localhost:3000/api/checkout';

            console.log('📡 Отправляем на:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ API ответ:', result);
                throw new Error(result.message || result.error || 'Ошибка при создании заказа');
            }

            console.log('✅ Заказ успешно создан:', result.orderId);
            clearCart();
            router.push(`/order-success/?orderId=${result.orderId}`);

        } catch (err) {
            console.error('❌ Ошибка при создании заказа:', err);
            alert(`Ошибка: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const cdekMap = new CDEKWidget({
        from: 'Новосибирск',
        root: 'cdek-map',
        apiKey: 'b443f28b-9003-4dfd-a7e4-56bd877bef2a',
        canChoose: true,
        defaultLocation: [82.9346, 55.0415],
        lang: 'rus',
        currency: 'RUB',
        servicePath: 'https://test.beastfpv.ru/wp-json/cdek/v1/webhook',
        hideDeliveryOptions: {
            office: false,
            door: true,
        },
        onReady() {
            console.log('Виджет загружен');
        },
        onCalculate() {
            console.log('Расчет стоимости доставки произведен');
        },
        onChoose() {
            console.log('Доставка выбрана');
        },
    });

    return (
        <section className="checkout">
            <div className="container checkout__container">
                <h1 className="checkout__header">Оформление заказа</h1>

                {/* ✅ ВЫБРАННЫЕ МЕТОДЫ ИЗ GRAPHQL */}
                <div className="checkout__methods-wrapper">
                    <div className="checkout__method">
                        <p className="checkout__method-label">Выбранный способ оплаты:</p>
                        <p className="checkout__method-value">
                            <b>{selectedPaymentMethod?.title || 'Не выбран'}</b>
                        </p>
                    </div>
                    <div className="checkout__method">
                        <p className="checkout__method-label">Выбранный способ доставки:</p>
                        <p className="checkout__method-value">
                            <b>{selectedShippingMethod?.title || 'Не выбран'}</b>
                        </p>
                    </div>
                    <div>
                        <Link href="/cart/" className="checkout__change-link continue-buy">
                            <b>Вернуться в корзину</b>
                        </Link>
                    </div>
                </div>

                <form className="checkout__form" onSubmit={handleSubmit}>
                    {/* ✅ ВСЕГДА ПОКАЗЫВАЕМ: ФИО, Телефон, Email */}
                    <div className="checkout__name-phone">
                        <div className="checkout__wrapper">
                            <p>ФИО</p>
                            <input
                                className="checkout__form-input"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="checkout__wrapper">
                            <p>Телефон</p>
                            <input
                                className="checkout__form-input"
                                type="tel"
                                name="phone"
                                placeholder="+7 (___) ___-__-__"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="checkout__wrapper">
                            <p>Email</p>
                            <input
                                className="checkout__form-input"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* ✅ УСЛОВНОЕ ОТОБРАЖЕНИЕ: Адрес только если это НЕ самовывоз */}
                    {!isPickup && (
                        <>
                            <div className="checkout__wrapper">
                                <p>Город</p>
                                <input
                                    className="checkout__form-input"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="checkout__adress">
                                <div className="checkout__wrapper checkout__street">
                                    <p>Улица</p>
                                    <input
                                        className="checkout__form-input"
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="checkout__wrapper checkout__house-ind">
                                    <div className="checkout__wrapper">
                                        <p>Дом</p>
                                        <input
                                            className="checkout__form-input"
                                            type="text"
                                            name="house"
                                            value={formData.house}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="checkout__wrapper">
                                        <p>Квартира</p>
                                        <input
                                            className="checkout__form-input"
                                            type="text"
                                            name="flat"
                                            value={formData.flat}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="checkout__wrapper">
                                        <p>Индекс</p>
                                        <input
                                            className="checkout__form-input"
                                            type="text"
                                            name="index"
                                            value={formData.index}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ✅ ЕСЛИ САМОВЫВОЗ - показываем уведомление */}
                    {isPickup && (
                        <div className="checkout__pickup-notice">
                            <p>📍 Вы выбрали <strong>самовывоз</strong> со склада.</p>
                            <p>Адрес склада: <strong>Москва, пр-т. Мира, 102, стр. 31</strong></p>
                            <p>Режим работы: <strong>Пн-Пт: 9:00-21:00, Сб: 11:00-16:00, Вс: выходной</strong></p>
                        </div>
                    )}

                    {/* ✅ ОТОБРАЖЕНИЕ ЦЕНЫ С ДОСТАВКОЙ ИЗ GRAPHQL */}
                    <div className="checkout__price-breakdown">
                        <div className="checkout__price-item">
                            <span><b>Подитог: </b></span>
                            <span>{formatPriceForDisplay(baseTotal)}</span>
                        </div>

                        {discountTotal > 0 && (
                            <div className="checkout__price-item discount">
                                <span><b>Скидка: </b></span>
                                <span>-{formatPriceForDisplay(discountTotal)}</span>
                            </div>
                        )}

                        {!isPickup && shippingCost > 0 && (
                            <div className="checkout__price-item">
                                <span><b>Доставка: </b></span>
                                <span>{formatPriceForDisplay(shippingCost)}</span>
                            </div>
                        )}

                        {isPickup && (
                            <div className="checkout__price-item">
                                <span><b>Доставка: </b></span>
                                <span>Бесплатно</span>
                            </div>
                        )}
                    </div>

                    <div className="checkout__price">
                        Сумма заказа: <span>{formatPriceForDisplay(finalTotal)}</span>
                    </div>

                    <div className="checkout__checkbox-wrapper">
                        <input
                            type="checkbox"
                            className="checkout__form-checkbox"
                            defaultChecked
                            required
                        />
                        <span>Я даю свое согласие на обработку своих персональных данных</span>
                    </div>

                    <button
                        type="submit"
                        className="checkout__form-button-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Обработка...' : 'Перейти к оплате'}
                    </button>
                </form>

                <NewItems products={new_products} />
            </div>
        </section>
    );
};

export default Checkout;
