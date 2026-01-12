'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useShippingMethods } from "../../lib/useShippingMethods";
import { usePaymentMethods } from "../../lib/usePaymentMethods";
import { useCoupon } from "../../lib/useCoupon";
import { useCartStore } from "../../stores/cartStore";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useQuery } from "@apollo/client";
import client from "../../lib/ApolloClient";

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

const getProductUrl = (item) => {
    if (item.slug) {
        return `/product/${item.slug}`;
    }
    return '/';
};

const Cart = () => {
    const { data, loading, error } = useHomeData();
    const { methods: shippingMethods, loading: shippingLoading } = useShippingMethods();
    const { methods: paymentMethods, loading: paymentLoading } = usePaymentMethods();
    const { applyCode, loading: couponLoading } = useCoupon();
    const [isUpdating, setIsUpdating] = useState(false);

    const {
        items,
        removeItem,
        updateQuantity,
        totalPrice,
        clearCart,
        selectedShipping,
        selectedPayment,
        setSelectedShipping,
        setSelectedPayment,
        updateCart,
    } = useCartStore();

    const [isClearing, setIsClearing] = useState(false);

    const allMethodsQuery = api.getCart();
    const data1 = useQuery(allMethodsQuery, {
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    console.log('📦 GraphQL Cart Data:', data1);

    // ───── КУПОНЫ ─────
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed');
    const [couponMessage, setCouponMessage] = useState('');

    // ───── ИНИЦИАЛИЗАЦИЯ СПОСОБОВ ДОСТАВКИ/ОПЛАТЫ ─────
    useEffect(() => {
        if (shippingMethods && shippingMethods.length > 0) {
            const methodExists = shippingMethods.some(m => m.id === selectedShipping);
            if (!methodExists) {
                setSelectedShipping(shippingMethods[0].id);
            }
        }
    }, [shippingMethods, selectedShipping, setSelectedShipping]);

    useEffect(() => {
        if (paymentMethods && paymentMethods.length > 0) {
            const methodExists = paymentMethods.some(m => m.id === selectedPayment);
            if (!methodExists) {
                setSelectedPayment(paymentMethods[0].id);
            }
        }
    }, [paymentMethods, selectedPayment, setSelectedPayment]);

    // ───── ПРЕОБРАЗОВАНИЕ ДАННЫХ КОРЗИНЫ ИЗ GRAPHQL ─────
    const graphQLCart = data1?.data?.cart || null;

    // ✅ ИСПРАВЛЕНО: правильное преобразование товаров
    const cartItemsFromGraphQL = graphQLCart?.contents?.nodes?.map(node => ({
        key: node.key, // ← ИСПОЛЬЗУЕМ KEY для уникальности!
        id: node.key,
        name: node.product?.node?.name || '',
        price: parsePrice(node.product?.node?.price),
        quantity: node.quantity,
        image: node.product?.node?.image?.sourceUrl || "/images/product_image.jpg",
        slug: node.product?.node?.slug || '',
        total: parsePrice(node.subtotal || '0'), // ✅ ДОБАВЛЕНО!
    })) || [];

    // ✅ ДОБАВЛЕНО: преобразование методов доставки из GraphQL
    const graphQLShippingMethods = graphQLCart?.availableShippingMethods
        ?.flatMap(pkg => pkg.rates || [])
        .map(rate => ({
            id: rate.id,
            title: rate.label,
            cost: parsePrice(rate.cost),
        })) || [];

    // ✅ ДОБАВЛЕНО: преобразование способов оплаты из GraphQL
    const graphQLPaymentMethods = data1?.data?.paymentGateways?.nodes?.map(gateway => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
    })) || [];

    // Выбираем источник данных для отрисовки:
    const displayItems = cartItemsFromGraphQL.length > 0
        ? cartItemsFromGraphQL
        : items;

    // ✅ ИЗМЕНЕНО: используем GraphQL данные, если они есть
    const displayShippingMethods = graphQLShippingMethods.length > 0
        ? graphQLShippingMethods
        : shippingMethods;

    const displayPaymentMethods = graphQLPaymentMethods.length > 0
        ? graphQLPaymentMethods
        : paymentMethods;

    const baseTotal = graphQLCart?.subtotal
        ? parsePrice(graphQLCart.subtotal)
        : totalPrice();

    const finalTotal = graphQLCart?.total
        ? parsePrice(graphQLCart.total)
        : totalPrice();

    const AppliedCouponAmount = graphQLCart?.discountTotal
        ? parsePrice(graphQLCart.discountTotal)
        : 0;

    // ───── ОБРАБОТЧИКИ ─────

    const handleClearCart = async () => {
        setIsClearing(true);

        try {
            console.log('🗑️ Очищаем корзину...');

            const EmptyCart = api.emptyCart();
            const { data: clearData } = await client.mutate({
                mutation: EmptyCart,
            });

            console.log('✅ Результат очистки:', clearData);

            if (clearData?.emptyCart?.cart) {
                updateCart(clearData.emptyCart.cart);
                clearCart();
                console.log('✅ Корзина успешно очищена');
            }

            await data1.refetch();

            setAppliedCoupon(null);
            setDiscountAmount(0);
            setCouponCode('');
            setCouponMessage('');

        } catch (err) {
            console.error('❌ Ошибка при очистке корзины:', err);
            alert('❌ Ошибка при очистке корзины');
        } finally {
            setIsClearing(false);
        }
    };

    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(id, newQuantity);
    };

    const handleRemoveItem = (id) => {
        removeItem(id);
    };

    const handleShippingChange = (methodId) => {
        setSelectedShipping(methodId);
    };

    const handlePaymentChange = (methodId) => {
        setSelectedPayment(methodId);
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('Введите код купона');
            return;
        }

        try {
            const result = await applyCode(couponCode);

            if (result?.success && result?.coupon?.code) {
                let discount = result.coupon.amount || 0;

                if (discount === 0) {
                    setCouponMessage('⚠️ Купон применён, но скидка нулевая');
                } else {
                    setCouponMessage('✅ Купон применён успешно!');
                }

                setAppliedCoupon(result.coupon.code);
                setDiscountType('fixed');
                setDiscountAmount(discount);
                setCouponCode('');
            } else {
                setCouponMessage('❌ Неверный купон или купон не активен');
                setAppliedCoupon(null);
                setDiscountAmount(0);
            }
        } catch (err) {
            setCouponMessage('❌ Ошибка при применении купона');
            setAppliedCoupon(null);
            setDiscountAmount(0);
            console.error('Coupon error:', err);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setDiscountType('fixed');
        setCouponCode('');
        setCouponMessage('');
    };

    // ───── СОСТОЯНИЯ ЗАГРУЗКИ / ОШИБОК ─────

    if (loading || shippingLoading || paymentLoading || data1.loading) {
        return (
            <section className="cart">
                <div className="container cart__container">
                    <h1 className="cart__header">Корзина</h1>
                    <div className="cart__empty">
                        <p>Загрузка...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error || data1.error) {
        return (
            <section className="cart">
                <div className="container cart__container">
                    <h1 className="cart__header">Корзина</h1>
                    <div className="cart__empty">
                        <p>❌ Ошибка: {error?.message || data1.error?.message}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="cart">
                <div className="container cart__container">
                    <h1 className="cart__header">Корзина</h1>
                    <div className="cart__empty">
                        <p>Нет данных</p>
                    </div>
                </div>
            </section>
        );
    }

    const { new_products } = data;

    if (displayItems.length === 0) {
        return (
            <section className="cart">
                <div className="container cart__container">
                    <h1 className="cart__header">Корзина</h1>
                    <div className="cart__empty">
                        <h3 className="checkout__header">Ваша корзина пуста</h3>
                        <br />
                        <Link href="/" className="continue-buy">Продолжить покупки</Link>
                    </div>
                    <NewItems products={new_products} />
                </div>
            </section>
        );
    }

    return (
        <section className="cart">
            <div className="container cart__container">
                <h1 className="cart__header">Корзина</h1>

                <div className="cart__wrapper">
                    {/* ЛЕВАЯ ЧАСТЬ - ТОВАРЫ */}
                    <div className="cart__items">
                        <div className="cart__items-list">
                            <div className="cart__product-table-title">
                                <span></span>
                                <span className="title-price">цена</span>
                                <span className="title-quantity">количество</span>
                                <span className="title-total">итого</span>
                                <span></span>
                                <span></span>
                            </div>

                            {/* ✅ ИСПРАВЛЕНО: правильный вывод цены и количества */}
                            {displayItems.map((item) => (
                                <div key={item.key} className="cart__product-item">
                                    <div className="cart__product-item-img">
                                        <img
                                            src={item.image || "/images/product_image.jpg"}
                                            alt={item.name}
                                            onError={(e) => {
                                                e.target.src = "/images/product_image.jpg";
                                            }}
                                        />
                                    </div>
                                    <div className="cart__product-item-inner">
                                        <Link className="cart__product-item-link" href={getProductUrl(item)}>
                                            {/* ✅ Используем item.name напрямую */}
                                            <div className="cart__product-item-name">{item.name}</div>
                                        </Link>
                                        <div className="cart__product-item-inner-wrapper">
                                            {/* ✅ Выводим правильную цену */}
                                            <div className="cart__product-item-price">
                                                {formatPriceForDisplay(item.price)}
                                            </div>
                                            <div className="cart__product-quantity">
                                                <button
                                                    className="button cart__product-minus"
                                                    onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                                                    disabled={isClearing}
                                                >
                                                    <img src="/images/minus.svg" alt="Уменьшить" />
                                                </button>
                                                {/* ✅ Выводим количество */}
                                                <input
                                                    className="cart__product-count"
                                                    value={item.quantity}
                                                    readOnly
                                                />
                                                <button
                                                    className="button cart__product-plus"
                                                    onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                                                    disabled={isClearing}
                                                >
                                                    <img src="/images/plus.svg" alt="Увеличить" />
                                                </button>
                                            </div>
                                            {/* ✅ Выводим итоговую стоимость правильно */}
                                            <div className="cart__product-item-final-price">
                                                {formatPriceForDisplay(item.total)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="cart__product-item-delete"
                                        onClick={() => handleRemoveItem(item.key)}
                                        disabled={isClearing}
                                    >
                                        <img src="/images/cart-delete.svg" alt="Удалить" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="cart__clear-button cart__coupon-submit"
                            onClick={handleClearCart}
                            disabled={isClearing || displayItems.length === 0}
                        >
                            {isClearing ? '⏳ Очищаем...' : 'Очистить корзину'}
                        </button>
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ - СУММА И МЕТОДЫ */}
                    <div className="cart__right-section">
                        <div className="cart__price-info">
                            <h3 className="cart__price-heading">Сумма заказа</h3>
                            <div className="cart__price-wrapper">
                                <div className="cart__price-one cart__price-underline">
                                    <span className="cart__price-name">Подитог:</span>
                                    <span className="cart__price-numb">
                                        {formatPriceForDisplay(baseTotal)}
                                    </span>
                                </div>

                                {AppliedCouponAmount > 0 && (
                                    <div className="cart__price-discount cart__price-underline">
                                        <span className="cart__price-name">
                                            Промокод:
                                        </span>
                                        <span className="cart__price-numb action-price">
                                            -{formatPriceForDisplay(AppliedCouponAmount)}
                                            {discountType === 'percent' && ' (10%)'}
                                        </span>
                                    </div>
                                )}

                                {couponMessage && (
                                    <div
                                        style={{
                                            fontSize: '12px',
                                            marginBottom: '10px',
                                            color: couponMessage.includes('✅') ? 'green' : 'red',
                                        }}
                                    >
                                        {couponMessage}
                                    </div>
                                )}

                                {/* ✅ ИЗМЕНЕНО: используем GraphQL методы оплаты */}
                                <div className="cart__price-shipping">
                                    <span className="cart__price-name">Способ оплаты:</span>
                                    <div className="cart__checkbox-wrapper">
                                        {displayPaymentMethods && displayPaymentMethods.length > 0 ? (
                                            displayPaymentMethods.map((method) => (
                                                <div key={method.id} className="cart__checkbox-main">
                                                    <input
                                                        type="radio"
                                                        id={`payment-${method.id}`}
                                                        name="payment"
                                                        value={method.id}
                                                        checked={selectedPayment === method.id}
                                                        onChange={() => handlePaymentChange(method.id)}
                                                        className="cart__payment-checkbox cart__shipping-checkbox"
                                                        disabled={isClearing}
                                                    />
                                                    <label htmlFor={`payment-${method.id}`}>
                                                        {method.title}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Методы оплаты недоступны</p>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ ИЗМЕНЕНО: используем GraphQL методы доставки */}
                                <div className="cart__price-shipping">
                                    <span className="cart__price-name">Способ доставки:</span>
                                    <div className="cart__checkbox-wrapper">
                                        {displayShippingMethods && displayShippingMethods.length > 0 ? (
                                            displayShippingMethods.map((method) => (
                                                <div key={method.id} className="cart__checkbox-main">
                                                    <input
                                                        type="radio"
                                                        id={`shipping-${method.id}`}
                                                        name="shipping"
                                                        value={method.id}
                                                        checked={selectedShipping === method.id}
                                                        onChange={() => handleShippingChange(method.id)}
                                                        className="cart__shipping-checkbox"
                                                        disabled={isClearing}
                                                    />
                                                    <label htmlFor={`shipping-${method.id}`}>
                                                        {method.title}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Методы доставки недоступны</p>
                                        )}
                                    </div>
                                </div>

                                <div className="cart__price-final">
                                    <span className="cart__price-name price-bold">Итого:</span>
                                    <span className="cart__price-numb">
                                        {formatPriceForDisplay(finalTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form
                            className="cart__form"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <div className="cart__coupon-apply">
                                <input
                                    className="cart__coupon-input"
                                    type="text"
                                    placeholder="Введите купон"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && !appliedCoupon && handleApplyCoupon()
                                    }
                                    disabled={!!appliedCoupon || couponLoading || isClearing}
                                />
                                <button
                                    type="button"
                                    className="cart__coupon-submit"
                                    onClick={appliedCoupon ? handleRemoveCoupon : handleApplyCoupon}
                                    disabled={couponLoading || isClearing}
                                >
                                    {couponLoading
                                        ? 'Проверка...'
                                        : appliedCoupon
                                            ? 'Удалить купон'
                                            : 'Применить'}
                                </button>
                            </div>

                            <Link
                                href="/checkout"
                                className="cart__form-button-submit"
                                style={{ display: 'block', textAlign: 'center', pointerEvents: isClearing ? 'none' : 'auto', opacity: isClearing ? 0.6 : 1 }}
                            >
                                Перейти к оформлению
                            </Link>
                        </form>
                    </div>
                </div>

                <NewItems products={new_products} />
            </div>
        </section>
    );
};

export default Cart;
