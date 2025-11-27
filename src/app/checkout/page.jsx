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
            // Подготавливаем данные заказа
            const orderData = {
                customer: {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || '',
                },
                shipping: {
                    city: formData.city,
                    street: formData.street,
                    house: formData.house,
                    flat: formData.flat,
                    index: formData.index,
                    method: selectedShippingMethod?.title,
                    methodId: selectedShipping,
                },
                payment: {
                    method: selectedPaymentMethod?.title,
                    methodId: selectedPayment,
                },
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                })),
                total: totalPrice(),
            };

            console.log('Отправляем заказ:', orderData);

            // Отправляем на сервер (API endpoint)
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error('Ошибка при оформлении заказа');
            }

            const result = await response.json();
            console.log('Заказ создан:', result);

            // Очищаем корзину
            clearCart();

            // Редирект на страницу успеха
            router.push(`/order-success?orderId=${result.orderId || ''}`);
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Ошибка при оформлении заказа. Попробуйте позже.');
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
