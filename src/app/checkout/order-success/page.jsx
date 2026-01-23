'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRestCart } from '../../../lib/hooks/useRestCart';
import wooRestApi from '../../../lib/woo_rest_api/rest_api';
import './page.scss';

const OrderSuccess = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');

    // ✅ Получаем функцию очистки корзины
    const { handleClearCart } = useRestCart();

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

                // ✅ Используем наше REST API для получения заказа
                const orderData = await wooRestApi.getOrder(orderId);

                console.log('✅ Order data:', orderData);

                setOrder(orderData);

                // ✅ После загрузки заказа - очищаем корзину
                await handleClearCart();

            } catch (err) {
                console.error('❌ Error fetching order:', err);
                setError(err.message || 'Не удалось загрузить заказ');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, handleClearCart]);

    // ✅ Функции форматирования
    const getStatusLabel = (status) => {
        const labels = {
            'pending': '⏳ Ожидание оплаты',
            'processing': '🚚 Обработка',
            'completed': '✅ Завершен',
            'cancelled': '❌ Отменен',
            'failed': '⚠️ Ошибка',
            'on-hold': '🔔 На удержании',
            'refunded': '💰 Возвращено',
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        return `order-success__status order-success__status--${status}`;
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // ✅ LOADING STATE
    if (loading) {
        return (
            <section className="order-success">
                <div className="container order-success__container">
                    <div className="order-success__loader">
                        <div className="spinner"></div>
                        <p>⏳ Загрузка данных заказа...</p>
                    </div>
                </div>
            </section>
        );
    }

    // ✅ ERROR STATE
    if (error || !order) {
        return (
            <section className="order-success">
                <div className="container order-success__container">
                    <div className="order-success__error">
                        <h2>⚠️ Ошибка</h2>
                        <p>{error || 'Заказ не найден'}</p>
                        <div className="order-success__actions">
                            <Link href="/" className="order-success__btn order-success__btn--primary">
                                На главную
                            </Link>
                            <Link href="/cart/" className="order-success__btn order-success__btn--secondary">
                                В корзину
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ✅ SUCCESS STATE
    return (
        <section className="order-success">
            <div className="container order-success__container">

                {/* ЗАГОЛОВОК С ИКОНОЙ */}
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
                            <span className="order-success__value">#{order.number || order.id}</span>
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
                                {formatDate(order.date_created)}
                            </span>
                        </div>

                        <div className="order-success__info-row">
                            <span className="order-success__label">Способ оплаты:</span>
                            <span className="order-success__value">
                                {order.payment_method_title || order.payment_method || 'Не указан'}
                            </span>
                        </div>

                        {/* СПОСОБ ДОСТАВКИ */}
                        {order.shipping_lines && order.shipping_lines.length > 0 && (
                            <div className="order-success__info-row">
                                <span className="order-success__label">Способ доставки:</span>
                                <span className="order-success__value">
                                    {order.shipping_lines[0].method_title}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* АДРЕС ДОСТАВКИ */}
                    {order.shipping && (
                        <div className="order-success__info-block">
                            <h2>📍 Адрес доставки</h2>
                            <address className="order-success__address">
                                <p>
                                    <strong>
                                        {order.shipping.first_name} {order.shipping.last_name}
                                    </strong>
                                </p>
                                <p>{order.shipping.address_1}</p>
                                {order.shipping.address_2 && <p>кв. {order.shipping.address_2}</p>}
                                <p>
                                    {order.shipping.postcode} {order.shipping.city}, {order.shipping.state}
                                </p>
                                <p>{order.shipping.country}</p>
                            </address>
                        </div>
                    )}

                    {/* КОНТАКТНАЯ ИНФОРМАЦИЯ */}
                    {order.billing && (
                        <div className="order-success__info-block">
                            <h2>📞 Контакты</h2>
                            <div className="order-success__info-row">
                                <span className="order-success__label">Email:</span>
                                <span className="order-success__value">
                                    <a href={`mailto:${order.billing.email}`}>
                                        {order.billing.email}
                                    </a>
                                </span>
                            </div>
                            {order.billing.phone && (
                                <div className="order-success__info-row">
                                    <span className="order-success__label">Телефон:</span>
                                    <span className="order-success__value">
                                        <a href={`tel:${order.billing.phone}`}>
                                            {order.billing.phone}
                                        </a>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ТОВАРЫ В ЗАКАЗЕ */}
                {order.line_items && order.line_items.length > 0 && (
                    <div className="order-success__items">
                        <h2>🛍️ Товары в заказе ({order.line_items.length})</h2>

                        <div className="order-success__items-list">
                            {order.line_items.map((item) => (
                                <div key={item.id} className="order-success__item">
                                    {/* Картинка товара (если есть в API) */}
                                    {item.image && (
                                        <div className="order-success__item-image">
                                            <img src={item.image.src} alt={item.name} />
                                        </div>
                                    )}

                                    {/* Информация о товаре */}
                                    <div className="order-success__item-info">
                                        <h4 className="order-success__item-name">{item.name}</h4>

                                        {/* SKU или ID товара */}
                                        {item.sku && (
                                            <p className="order-success__item-sku">
                                                SKU: <strong>{item.sku}</strong>
                                            </p>
                                        )}

                                        {/* Вариант товара (если есть) */}
                                        {item.variation_id && (
                                            <p className="order-success__item-variation">
                                                Вариант товара
                                            </p>
                                        )}
                                    </div>

                                    {/* КОЛИЧЕСТВО И ЦЕНЫ */}
                                    <div className="order-success__item-details">
                                        <div className="order-success__item-qty">
                                            <span className="order-success__item-qty-label">Кол-во:</span>
                                            <span className="order-success__item-qty-value">
                                                {item.quantity} шт.
                                            </span>
                                        </div>

                                        <div className="order-success__item-price">
                                            <span className="order-success__item-price-label">Цена:</span>
                                            <span className="order-success__item-price-value">
                                                {formatPrice(item.price)} ₽
                                            </span>
                                        </div>

                                        <div className="order-success__item-total">
                                            <span className="order-success__item-total-label">Итого:</span>
                                            <span className="order-success__item-total-value">
                                                <strong>{formatPrice(item.total)} ₽</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ИТОГОВАЯ СТОИМОСТЬ */}
                <div className="order-success__totals">
                    <div className="order-success__totals-row">
                        <span className="order-success__totals-label">Подитог товаров:</span>
                        <span className="order-success__totals-value">
                            {formatPrice(order.subtotal)} ₽
                        </span>
                    </div>

                    {/* ДОСТАВКА */}
                    {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                        <div className="order-success__totals-row">
                            <span className="order-success__totals-label">Доставка:</span>
                            <span className="order-success__totals-value">
                                +{formatPrice(order.shipping_total)} ₽
                            </span>
                        </div>
                    )}

                    {/* НАЛОГИ */}
                    {order.tax_total && parseFloat(order.tax_total) > 0 && (
                        <div className="order-success__totals-row">
                            <span className="order-success__totals-label">Налоги:</span>
                            <span className="order-success__totals-value">
                                +{formatPrice(order.tax_total)} ₽
                            </span>
                        </div>
                    )}

                    {/* СКИДКА */}
                    {order.discount_total && parseFloat(order.discount_total) > 0 && (
                        <div className="order-success__totals-row order-success__totals-row--discount">
                            <span className="order-success__totals-label">Скидка/Купон:</span>
                            <span className="order-success__totals-value">
                                -{formatPrice(order.discount_total)} ₽
                            </span>
                        </div>
                    )}

                    {/* ИТОГОВАЯ СУММА */}
                    <div className="order-success__totals-row order-success__totals-row--final">
                        <span className="order-success__totals-label">
                            <strong>ИТОГО К ОПЛАТЕ:</strong>
                        </span>
                        <span className="order-success__totals-value">
                            <strong>{formatPrice(order.total)} ₽</strong>
                        </span>
                    </div>
                </div>

                {/* ПРИМЕЧАНИЯ ЗАКАЗА */}
                {order.customer_note && (
                    <div className="order-success__notes">
                        <h3>📝 Примечание к заказу</h3>
                        <p>{order.customer_note}</p>
                    </div>
                )}

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
                        <li>✅ На вашу почту <strong>{order.billing.email}</strong> отправлено подтверждение заказа</li>
                        <li>📦 Вы получите уведомление о готовности к отправке</li>
                        <li>🔍 Отследить статус заказа можно по номеру <strong>#{order.number || order.id}</strong></li>

                        {/* Конкретные инструкции по способу оплаты */}
                        {order.payment_method === 'cod' && (
                            <li>💵 Оплату необходимо произвести наличными при получении товара</li>
                        )}

                        {order.payment_method === 'card' && (
                            <li>💳 Ваша карта уже была обработана. Если оплата не прошла, попробуйте снова</li>
                        )}

                        {order.payment_method === 'bank_transfer' && (
                            <li>🏦 Пожалуйста, произведите банковский перевод по реквизитам, указанным в письме</li>
                        )}

                        <li>❓ Если у вас есть вопросы, свяжитесь с нами через форму контактов</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default OrderSuccess;