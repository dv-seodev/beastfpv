'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import './page.scss';

const OrderSuccess = () => {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            setError('ID заказа не найден');
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                console.log(`📍 Fetching order: ${orderId}`);

                // ✅ Вызываем НАШЕ API (не WooCommerce напрямую!)
                const response = await fetch(`/api/auth/orders/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log(`📊 API Response Status: ${response.status}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Response text:', errorText);

                    try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.error || 'Не удалось загрузить заказ');
                    } catch {
                        throw new Error('Не удалось загрузить заказ');
                    }
                }

                const data = await response.json();
                console.log('✅ Order data:', data);

                setOrder(data);
            } catch (err) {
                console.error('❌ Error fetching order:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <section className="order-success">
                <div className="container order-success__container">
                    <div className="order-success__loader">⏳ Загрузка данных заказа...</div>
                </div>
            </section>
        );
    }

    if (error || !order) {
        return (
            <section className="order-success">
                <div className="container order-success__container">
                    <div className="order-success__error">
                        <h2>⚠️ Ошибка</h2>
                        <p>{error || 'Заказ не найден'}</p>
                        <Link href="/" className="order-success__btn order-success__btn--home">
                            На главную
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Ожидание оплаты',
            'processing': 'Обработка',
            'completed': 'Завершен',
            'failed': 'Ошибка',
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        return `order-success__status order-success__status--${status}`;
    };

    return (
        <section className="order-success">
            <div className="container order-success__container">
                {/* ЗАГОЛОВОК */}
                <div className="order-success__header">
                    <span className="order-success__icon">✅</span>
                    <h1>Спасибо за заказ!</h1>
                    <p>Ваш заказ успешно оформлен</p>
                </div>

                {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
                <div className="order-success__main">
                    {/* ИНФОРМАЦИЯ О ЗАКАЗЕ */}
                    <div className="order-success__info-block">
                        <h2>📋 Информация о заказе</h2>

                        <div className="order-success__info-row">
                            <span className="order-success__label">Номер заказа:</span>
                            <span className="order-success__value">#{order.number || orderId}</span>
                        </div>

                        <div className="order-success__info-row">
                            <span className="order-success__label">Статус:</span>
                            <span className={getStatusClass(order.status)}>
                                {getStatusLabel(order.status)}
                            </span>
                        </div>

                        <div className="order-success__info-row">
                            <span className="order-success__label">Дата:</span>
                            <span className="order-success__value">
                                {new Date(order.date_created).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>

                        <div className="order-success__info-row">
                            <span className="order-success__label">Способ оплаты:</span>
                            <span className="order-success__value">{order.payment_method_title}</span>
                        </div>
                    </div>

                    {/* АДРЕС ДОСТАВКИ */}
                    <div className="order-success__info-block">
                        <h2>📍 Адрес доставки</h2>
                        <address className="order-success__address">
                            <p>
                                <strong>{order.shipping.first_name} {order.shipping.last_name}</strong>
                            </p>
                            <p>{order.shipping.address_1}</p>
                            {order.shipping.address_2 && <p>кв. {order.shipping.address_2}</p>}
                            <p>{order.shipping.postcode} {order.shipping.city}</p>
                            <p>{order.shipping.country}</p>
                        </address>
                    </div>

                    {/* КОНТАКТНАЯ ИНФОРМАЦИЯ */}
                    <div className="order-success__info-block">
                        <h2>📞 Контакты</h2>
                        <div className="order-success__info-row">
                            <span className="order-success__label">Email:</span>
                            <span className="order-success__value">{order.billing.email}</span>
                        </div>
                        <div className="order-success__info-row">
                            <span className="order-success__label">Телефон:</span>
                            <span className="order-success__value">{order.billing.phone}</span>
                        </div>
                    </div>
                </div>

                {/* ТОВАРЫ В ЗАКАЗЕ */}
                {order.line_items && order.line_items.length > 0 && (
                    <div className="order-success__items">
                        <h2>🛍️ Товары в заказе</h2>
                        <table className="order-success__table">
                            <thead>
                                <tr>
                                    <th>Товар</th>
                                    <th>Количество</th>
                                    <th>Цена</th>
                                    <th>Итого</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.line_items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="order-success__item-name">{item.name}</td>
                                        <td className="order-success__item-qty">{item.quantity}</td>
                                        <td className="order-success__item-price">{item.price} ₽</td>
                                        <td className="order-success__item-total">{item.total} ₽</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ИТОГОВАЯ СТОИМОСТЬ */}
                <div className="order-success__totals">
                    <div className="order-success__total-row">
                        <span>Подитог:</span>
                        <span>{order.subtotal} ₽</span>
                    </div>

                    {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                        <div className="order-success__total-row">
                            <span>Доставка:</span>
                            <span>{order.shipping_total} ₽</span>
                        </div>
                    )}

                    {order.discount_total && parseFloat(order.discount_total) > 0 && (
                        <div className="order-success__total-row order-success__total-row--discount">
                            <span>Скидка:</span>
                            <span>-{order.discount_total} ₽</span>
                        </div>
                    )}

                    <div className="order-success__total-row order-success__total-row--final">
                        <span>Итого:</span>
                        <span>{order.total} ₽</span>
                    </div>
                </div>

                {/* КНОПКИ ДЕЙСТВИЙ */}
                <div className="order-success__actions">
                    <Link href="/" className="order-success__btn order-success__btn--primary">
                        На главную
                    </Link>
                    <Link href="/cart/" className="order-success__btn order-success__btn--secondary">
                        Продолжить покупки
                    </Link>
                </div>

                {/* ИНФОРМАЦИОННЫЙ БЛОК */}
                <div className="order-success__notice">
                    <h3>📧 Что дальше?</h3>
                    <ul>
                        <li>На вашу почту отправлено подтверждение заказа</li>
                        <li>Вы получите уведомление о готовности к отправке</li>
                        <li>Отследить статус заказа можно по номеру #{order.number || orderId}</li>
                        <li>Если у вас есть вопросы, свяжитесь с нами через форму контактов</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default OrderSuccess;
