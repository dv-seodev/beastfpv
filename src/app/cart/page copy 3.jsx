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
    const [isUpdating, setIsUpdating] = useState(false);
    const [couponMessage, setCouponMessage] = useState('');
    const [couponCode, setCouponCode] = useState('');

    const allMethodsQuery = api.getCart();
    const data1 = useQuery(allMethodsQuery, {
        errorPolicy: 'all',
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
    });

    console.log('📦 GraphQL Cart Data:', data1);

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

    const cartItemsFromGraphQL = graphQLCart?.contents?.nodes?.map(node => ({
        key: node.key,
        id: node.key,
        name: node.product?.node?.name || '',
        price: parsePrice(node.product?.node?.price),
        quantity: node.quantity,
        image: node.product?.node?.image?.sourceUrl || "/images/product_image.jpg",
        slug: node.product?.node?.slug || '',
        total: parsePrice(node.subtotal || '0'),
    })) || [];

    const graphQLShippingMethods = graphQLCart?.availableShippingMethods
        ?.flatMap(pkg => pkg.rates || [])
        .map(rate => ({
            id: rate.id,
            title: rate.label,
            // cost: parsePrice(rate.cost),
        })) || [];

    const graphQLPaymentMethods = data1?.data?.paymentGateways?.nodes?.map(gateway => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
    })) || [];

    const displayItems = cartItemsFromGraphQL.length > 0
        ? cartItemsFromGraphQL
        : items;

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

            setCouponCode('');
            setCouponMessage('');

        } catch (err) {
            console.error('❌ Ошибка при очистке корзины:', err);
            alert('❌ Ошибка при очистке корзины');
        } finally {
            setIsClearing(false);
        }
    };

    // ✅ ИЗМЕНЕНИЕ КОЛИЧЕСТВА ТОВАРА
    const handleQuantityChange = async (itemKey, newQuantity) => {
        if (newQuantity < 1) return;

        setIsUpdating(true);

        try {
            console.log(`📦 Изменяем количество товара ${itemKey} на ${newQuantity}`);

            const UpdateQuantity = api.updateItemQuantities();
            const { data: updateData } = await client.mutate({
                mutation: UpdateQuantity,
                variables: {
                    input: {
                        items: [
                            {
                                key: itemKey,
                                quantity: newQuantity,
                            }
                        ]
                    }
                }
            });

            console.log('✅ Результат обновления количества:', updateData);

            if (updateData?.updateItemQuantities?.cart) {
                updateCart(updateData.updateItemQuantities.cart);
                updateQuantity(itemKey, newQuantity);
                console.log('✅ Количество товара успешно обновлено');
            }

            await data1.refetch();

        } catch (err) {
            console.error('❌ Ошибка при изменении количества:', err);
            alert('❌ Ошибка при изменении количества товара');
        } finally {
            setIsUpdating(false);
        }
    };

    // ✅ УДАЛЕНИЕ ТОВАРА ИЗ КОРЗИНЫ
    const handleRemoveItem = async (itemKey) => {
        setIsUpdating(true);

        try {
            console.log(`🗑️ Удаляем товар ${itemKey} из корзины`);

            const RemoveFromCart = api.removeItemsFromCart();
            const { data: removeData } = await client.mutate({
                mutation: RemoveFromCart,
                variables: {
                    input: {
                        keys: [itemKey]
                    }
                }
            });

            console.log('✅ Результат удаления:', removeData);

            if (removeData?.removeItemsFromCart?.cart) {
                updateCart(removeData.removeItemsFromCart.cart);
                removeItem(itemKey);
                console.log('✅ Товар успешно удалён из корзины');
            }

            await data1.refetch();

        } catch (err) {
            console.error('❌ Ошибка при удалении товара:', err);
            alert('❌ Ошибка при удалении товара из корзины');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleShippingChange = (methodId) => {
        setSelectedShipping(methodId);
    };

    const handlePaymentChange = (methodId) => {
        setSelectedPayment(methodId);
    };

    // ✅ ПРИМЕНЕНИЕ КУПОНА
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponMessage('Введите код купона');
            return;
        }

        try {
            console.log(`💳 Применяем купон: ${couponCode}`);

            const ApplyCouponMutation = api.applyCouponMutation();
            const { data: couponData } = await client.mutate({
                mutation: ApplyCouponMutation,
                variables: {
                    input: {
                        code: couponCode
                    }
                }
            });

            console.log('✅ Ответ купона:', couponData);

            await data1.refetch();

        } catch (err) {
            console.error('❌ Ошибка при применении купона:', err);
            setCouponMessage('❌ Неверный купон или купон не активен');
        }
    };

    // ✅ УДАЛЕНИЕ КУПОНА
    const handleRemoveCoupon = async () => {
        try {
            console.log('🗑️ Удаляем купон');

            const RemoveCouponMutation = api.removeCouponMutation();
            const { data: removedData } = await client.mutate({
                mutation: RemoveCouponMutation,
                variables: {
                    input: {
                        codes: [graphQLCart?.appliedCoupons?.[0]?.code] // codes - множественное число!
                    }
                }
            });

            console.log('✅ Купон удалён:', removedData);

            await data1.refetch();

            setCouponCode('');
            setCouponMessage('');

        } catch (err) {
            console.error('❌ Ошибка при удалении купона:', err);
            alert('Ошибка при удалении купона');
        }
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
                                            <div className="cart__product-item-name">{item.name}</div>
                                        </Link>
                                        <div className="cart__product-item-inner-wrapper">
                                            <div className="cart__product-item-price">
                                                {formatPriceForDisplay(item.price)}
                                            </div>
                                            <div className="cart__product-quantity">
                                                <button
                                                    className="button cart__product-minus"
                                                    onClick={() => {
                                                        if (item.quantity === 1) {
                                                            handleRemoveItem(item.key);
                                                        } else {
                                                            handleQuantityChange(item.key, item.quantity - 1);
                                                        }
                                                    }}
                                                    disabled={isUpdating || isClearing}
                                                    title={
                                                        isUpdating
                                                            ? "Обновление..."
                                                            : item.quantity === 1
                                                                ? "Удалить товар"
                                                                : "Уменьшить количество"
                                                    }
                                                >
                                                    <img src="/images/minus.svg" alt="Уменьшить" />
                                                </button>
                                                <input
                                                    className="cart__product-count"
                                                    value={item.quantity}
                                                    readOnly
                                                />
                                                <button
                                                    className="button cart__product-plus"
                                                    onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                                                    disabled={isUpdating || isClearing}
                                                    title={isUpdating ? "Обновление..." : "Увеличить количество"}
                                                >
                                                    <img src="/images/plus.svg" alt="Увеличить" />
                                                </button>
                                            </div>
                                            <div className="cart__product-item-final-price">
                                                {formatPriceForDisplay(item.total)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="cart__product-item-delete"
                                        onClick={() => handleRemoveItem(item.key)}
                                        disabled={isUpdating || isClearing}
                                        title={isUpdating ? "Удаление..." : "Удалить товар"}
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
                            disabled={isClearing || isUpdating || displayItems.length === 0}
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

                                {/* ✅ ОТОБРАЖЕНИЕ ПРИМЕНЁННОГО КУПОНА */}
                                {graphQLCart?.appliedCoupons && graphQLCart.appliedCoupons.length > 0 && (
                                    <div className="cart__price-discount cart__price-underline">
                                        <span className="cart__price-name">
                                            Промокод ({graphQLCart.appliedCoupons[0].code}):
                                        </span>
                                        <span className="cart__price-numb action-price">
                                            -{formatPriceForDisplay(parsePrice(graphQLCart.appliedCoupons[0].discountAmount))}
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

                                {/* СПОСОБ ОПЛАТЫ */}
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
                                                        disabled={isClearing || isUpdating}
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

                                {/* СПОСОБ ДОСТАВКИ */}
                                <div className="cart__price-shipping">
                                    <span className="cart__price-name">Способы доставки:</span>
                                    <div className="cart__checkbox-wrapper">
                                        {displayShippingMethods && displayShippingMethods.length > 0 ? (
                                            displayShippingMethods.map((method) => (
                                                <div key={method.id} className="cart__checkbox-main">
                                                    <input
                                                        type="radio"
                                                        id={`shipping-${method.id}`}
                                                        name="shipping"
                                                        value={method.id}
                                                        // ✅ ИСПРАВЛЕНО: просто проверяем selectedShipping
                                                        checked={selectedShipping === method.id}
                                                        onChange={() => handleShippingChange(method.id)}
                                                        className="cart__shipping-checkbox"
                                                        disabled={isClearing || isUpdating}
                                                    />
                                                    <label htmlFor={`shipping-${method.id}`}>
                                                        {method.title}
                                                        {method.cost > 0 && ` (+${formatPriceForDisplay(method.cost)})`}
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
                            {/* БЛОК С КУПОНОМ */}
                            <div className="cart__coupon-apply">
                                <input
                                    className="cart__coupon-input"
                                    type="text"
                                    placeholder="Введите купон"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        (!graphQLCart?.appliedCoupons || graphQLCart.appliedCoupons.length === 0) &&
                                        handleApplyCoupon()
                                    }
                                    disabled={
                                        (graphQLCart?.appliedCoupons && graphQLCart.appliedCoupons.length > 0) ||
                                        couponLoading ||
                                        isClearing ||
                                        isUpdating
                                    }
                                />
                                <button
                                    type="button"
                                    className="cart__coupon-submit"
                                    onClick={
                                        graphQLCart?.appliedCoupons && graphQLCart.appliedCoupons.length > 0
                                            ? handleRemoveCoupon
                                            : handleApplyCoupon
                                    }
                                    disabled={couponLoading || isClearing || isUpdating}
                                >
                                    {couponLoading
                                        ? 'Проверка...'
                                        : graphQLCart?.appliedCoupons && graphQLCart.appliedCoupons.length > 0
                                            ? 'Удалить купон'
                                            : 'Применить'}
                                </button>
                            </div>

                            <Link
                                href="/checkout"
                                className="cart__form-button-submit"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    pointerEvents: (isClearing || isUpdating) ? 'none' : 'auto',
                                    opacity: (isClearing || isUpdating) ? 0.6 : 1
                                }}
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
