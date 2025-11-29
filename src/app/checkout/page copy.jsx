'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useShippingMethods } from "../../lib/useShippingMethods";
import { usePaymentMethods } from "../../lib/usePaymentMethods";
import { useCartStore } from "../../stores/cartStore";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Checkout = () => {
    const router = useRouter();
    const { data, loading, error } = useHomeData();
    const { methods: shippingMethods } = useShippingMethods();
    const { methods: paymentMethods } = usePaymentMethods();

    const {
        items,
        totalPrice,
        selectedShipping,
        selectedPayment,
        clearCart,
    } = useCartStore();

    // Форма состояние
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        city: '',
        street: '',
        house: '',
        flat: '',
        index: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!data) return <div>Нет данных</div>;

    const { new_products } = data;

    // Если корзина пуста
    if (items.length === 0) {
        return (
            <section className="checkout">
                <div className="container checkout__container">
                    <h3 className="checkout__header">Ваша корзина пуста</h3>
                    <Link className="continue-buy" href="/cart">Продолжить покупки</Link>
                </div>
            </section>
        );
    }

    // Получаем названия выбранных методов
    const selectedShippingMethod = shippingMethods.find(m => m.id === selectedShipping);
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedPayment);

    const formatPriceForDisplay = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const orderData = {
                payment_method: selectedPayment || 'bacs',
                payment_method_title: selectedPaymentMethod?.title || 'Bank Transfer',
                set_paid: false,
                billing: {
                    first_name: formData.name.split(' ')[0],
                    last_name: formData.name.split(' ')[1] || '',
                    phone: formData.phone,
                    email: formData.email || '',
                    address_1: `${formData.street} ${formData.house}`,
                    address_2: formData.flat || '',
                    city: formData.city,
                    postcode: formData.index,
                    country: 'RU',
                    state: 'RU',
                },
                shipping: {
                    first_name: formData.name.split(' ')[0],
                    last_name: formData.name.split(' ')[1] || '',
                    address_1: `${formData.street} ${formData.house}`,
                    address_2: formData.flat || '',
                    city: formData.city,
                    postcode: formData.index,
                    country: 'RU',
                    state: 'RU',
                },
                line_items: items.map(item => ({
                    product_id: item.databaseId || item.id,
                    quantity: item.quantity,
                })),
                shipping_lines: [
                    {
                        method_id: selectedShipping || 'flat_rate',
                        method_title: selectedShippingMethod?.title || 'Flat Rate',
                    },
                ],
            };

            console.log('Отправляем заказ в WooCommerce:', orderData);

            // Кодируем credentials для Basic Auth
            const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
            const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;
            const credentials = btoa(`${consumerKey}:${consumerSecret}`);

            const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

            const response = await fetch(`https://test.beastfpv.ru/wp-json/wc/v3/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`,
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Ошибка при создании заказа');
            }

            console.log('Заказ создан в WooCommerce:', result.id);

            // Очищаем корзину
            clearCart();

            // Редирект на страницу успеха
            router.push(`/order-success?orderId=${result.id || ''}`);
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <section className="checkout">
            <div className="container checkout__container">
                <h1 className="checkout__header">Оформление заказа</h1>
                <div className="checkout__methods-wrapper">
                    <div className="checkout__method">
                        <p className="checkout__method-label">Выбранный способ оплаты:</p>
                        <p className="checkout__method-value"><b>
                            {selectedPaymentMethod?.title || 'Не выбран'}
                        </b>
                        </p>
                    </div>
                    <div className="checkout__method">
                        <p className="checkout__method-label">Выбранный способ доставки:</p>
                        <p className="checkout__method-value">
                            <b>
                                {selectedShippingMethod?.title || 'Не выбран'}
                            </b>
                        </p>
                    </div>
                    <div>
                        <Link href="/cart" className="checkout__change-link continue-buy"><b>
                            Вернуться в корзину
                        </b>
                        </Link>
                    </div>
                </div>

                <form className="checkout__form" onSubmit={handleSubmit}>
                    {/* ДАННЫЕ ПОКУПАТЕЛЯ */}
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
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    {/* АДРЕС ДОСТАВКИ */}
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

                    {/* СУММА ЗАКАЗА */}
                    <div className="checkout__price">
                        Сумма заказа: <span>{formatPriceForDisplay(totalPrice())}</span>
                    </div>

                    {/* СОГЛАСИЕ НА ОБРАБОТКУ ДАННЫХ */}
                    <div className="checkout__checkbox-wrapper">
                        <input
                            type="checkbox"
                            className="checkout__form-checkbox"
                            defaultChecked
                            required
                        />
                        <span>Я даю свое согласие на обработку своих персональных данных</span>
                    </div>

                    {/* КНОПКА ОТПРАВКИ */}
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
}

export default Checkout;
