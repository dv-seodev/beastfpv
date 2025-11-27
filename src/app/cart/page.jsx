'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useShippingMethods } from "../../lib/useShippingMethods";
import { usePaymentMethods } from "../../lib/usePaymentMethods";
import { useCartStore } from "../../stores/cartStore";
import { useEffect } from "react";

const Cart = () => {
    const { data, loading, error } = useHomeData();
    const { methods: shippingMethods, loading: shippingLoading } = useShippingMethods();
    const { methods: paymentMethods, loading: paymentLoading } = usePaymentMethods();

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
    } = useCartStore();

    // Проверяем, что выбранные методы существуют в списках
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

    if (loading || shippingLoading || paymentLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!data) return <div>Нет данных</div>;

    const { new_products } = data;

    // Если корзина пустая
    if (items.length === 0) {
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

    const formatPriceForDisplay = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

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
                                <span>цена</span>
                                <span>количество</span>
                                <span>итого</span>
                                <span></span>
                            </div>

                            {items.map((item) => (
                                <div key={item.id} className="cart__product-item">
                                    <div className="cart__product-item-img">
                                        <img
                                            src={item.image || "/images/product_image.jpg"}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="cart__product-item-inner">
                                        <Link className="cart__product-item-link" href={`/product/${item.slug || '#'}`}>
                                            <div className="cart__product-item-name">{item.name}</div>
                                        </Link>
                                        <div className="cart__product-item-inner-wrapper">
                                            <div className="cart__product-item-price">
                                                {formatPriceForDisplay(item.price)}
                                            </div>
                                            <div className="cart__product-quantity">
                                                <button
                                                    className="button cart__product-minus"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
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
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                >
                                                    <img src="/images/plus.svg" alt="Увеличить" />
                                                </button>
                                            </div>
                                            <div className="cart__product-item-final-price">
                                                {formatPriceForDisplay(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="cart__product-item-delete"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        <img src="/images/cart-delete.svg" alt="Удалить" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="cart__clear-button cart__coupon-submit"
                            onClick={clearCart}
                        >
                            Очистить корзину
                        </button>
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ - СУММА И МЕТОДЫ */}
                    <div className="cart__right-section">
                        <div className="cart__price-info">
                            <h3 className="cart__price-heading">Сумма заказа</h3>
                            <div className="cart__price-wrapper">
                                <div className="cart__price-one cart__price-underline">
                                    <span className="cart__price-name">Подитог:</span>
                                    <span className="cart__price-numb">{formatPriceForDisplay(totalPrice())}</span>
                                </div>
                                <div className="cart__price-discount cart__price-underline">
                                    <span className="cart__price-name">Купон:</span>
                                    <span className="cart__price-numb action-price">-0 ₽</span>
                                </div>

                                {/* МЕТОДЫ ОПЛАТЫ */}
                                <div className="cart__price-shipping">
                                    <span className="cart__price-name">Способ оплаты:</span>
                                    <div className="cart__checkbox-wrapper">
                                        {paymentMethods && paymentMethods.length > 0 ? (
                                            paymentMethods.map((method) => (
                                                <div key={method.id} className="cart__checkbox-main">
                                                    <input
                                                        type="radio"
                                                        id={`payment-${method.id}`}
                                                        name="payment"
                                                        value={method.id}
                                                        checked={selectedPayment === method.id}
                                                        onChange={() => handlePaymentChange(method.id)}
                                                        className="cart__payment-checkbox cart__shipping-checkbox"
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

                                {/* МЕТОДЫ ДОСТАВКИ */}
                                <div className="cart__price-shipping">
                                    <span className="cart__price-name">Способ доставки:</span>
                                    <div className="cart__checkbox-wrapper">
                                        {shippingMethods && shippingMethods.length > 0 ? (
                                            shippingMethods.map((method) => (
                                                <div key={method.id} className="cart__checkbox-main">
                                                    <input
                                                        type="radio"
                                                        id={`shipping-${method.id}`}
                                                        name="shipping"
                                                        value={method.id}
                                                        checked={selectedShipping === method.id}
                                                        onChange={() => handleShippingChange(method.id)}
                                                        className="cart__shipping-checkbox"
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
                                    <span className="cart__price-numb">{formatPriceForDisplay(totalPrice())}</span>
                                </div>
                            </div>
                        </div>

                        <form className="cart__form" onSubmit={(e) => {
                            e.preventDefault();
                        }}>
                            <div className="cart__coupon-apply">
                                <input className="cart__coupon-input" type="text" placeholder="Введите купон" />
                                <button type="button" className="cart__coupon-submit">Применить</button>
                            </div>
                            <Link href="/checkout" className="cart__form-button-submit" style={{ display: 'block', textAlign: 'center' }}>
                                Перейти к оформлению
                            </Link>
                        </form>
                    </div>
                </div>

                <NewItems products={new_products} />
            </div>
        </section>
    );
}

export default Cart;
