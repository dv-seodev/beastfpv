'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../page.scss';
import { useAuth } from '../../../../lib/useAuth';

const OrderDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user, token, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        fetchOrderDetails();
    }, [user, token, authLoading]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`📋 Fetching order #${params.orderId}`);

            const response = await fetch(`/api/auth/orders/${params.orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const { order } = await response.json();
            console.log(`✅ Order loaded:`, order);
            setOrder(order);

        } catch (err) {
            console.error('🔴 Error loading order:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0 ₽';

        // Убираем HTML entities
        const cleanPrice = String(price)
            .replace(/&nbsp;/g, ' ')
            .replace(/&#039;/g, "'")
            .trim();

        return cleanPrice;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'Ожидание', color: '#FFA500' },
            'processing': { label: 'Обработка', color: '#4169E1' },
            'on-hold': { label: 'На удержании', color: '#FF6347' },
            'completed': { label: 'Завершён', color: '#32CD32' },
            'cancelled': { label: 'Отменён', color: '#808080' },
            'refunded': { label: 'Возврат', color: '#DC143C' },
            'failed': { label: 'Ошибка', color: '#8B0000' },
        };

        const normalizedStatus = String(status).toLowerCase().replace('_', '-');
        return statusMap[normalizedStatus] || { label: status, color: '#666' };
    };

    if (authLoading || loading) {
        return (
            <section className="account__section">
                <div className="account__container">
                    <div className="account__loading">
                        <div className="account__loading-box"></div>
                        <div className="account__loading-box"></div>
                        <div className="account__loading-box"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="account__section">
                <div className="account__container">
                    <div className="account__error">
                        ❌ Ошибка: {error}
                    </div>
                    <Link href="/account/orders" className="account__back-link">
                        ← Вернуться к заказам
                    </Link>
                </div>
            </section>
        );
    }

    if (!order) {
        return (
            <section className="account__section">
                <div className="account__container">
                    <div className="account__error">
                        ❌ Заказ не найден
                    </div>
                    <Link href="/account/orders" className="account__back-link">
                        ← Вернуться к заказам
                    </Link>
                </div>
            </section>
        );
    }

    const statusInfo = getStatusBadge(order.status);
    const orderItems = order.lineItems?.nodes || [];

    return (
        <section className="account-order">
            <div className="container account__container">
                <section className="account__section">
                    <div className="account__container">
                        <Link href="/account/orders" className="account__back-link">
                            ← Вернуться к заказам
                        </Link>
                        {/* ЗАГОЛОВОК */}
                        <div className="account__header">

                            <h1 className="account__title">Заказ #{order.orderNumber}</h1>
                            <p className="account__subtitle">
                                📅 {new Date(order.date).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        {/* СТАТУС И ИТОГО */}
                        <div className="account__order-summary">
                            <div className="account__order-status">
                                <span
                                    className="account__status-badge"
                                    style={{ backgroundColor: statusInfo.color }}
                                >
                                    {statusInfo.label}
                                </span>
                            </div>
                            <div className="account__order-total">
                                <span className="account__total-label">Итого:</span>
                                <span className="account__total-amount">
                                    {formatPrice(order.total)} ₽
                                </span>
                            </div>
                        </div>

                        {/* ТОВАРЫ */}
                        <div className="account__order-items">
                            <h2 className="account__section-title">📦 Товары в заказе</h2>
                            {orderItems.length > 0 ? (
                                <div className="account__items-list">
                                    {orderItems.map((item) => (
                                        <div key={item.productId} className="account__order-detail-item">
                                            <div className="account__item-info">
                                                <div className="account__item-image">
                                                    {item.product?.node?.image?.sourceUrl && (
                                                        <img
                                                            src={item.product.node.image.sourceUrl}
                                                            alt={item.product.node.name}
                                                        />
                                                    )}
                                                </div>
                                                <div className="account__item-details">
                                                    <Link
                                                        href={`/product/${item.product?.node?.slug}`}
                                                        className="account__item-name"
                                                    >
                                                        {item.product?.node?.name || 'Товар'}
                                                    </Link>
                                                    <div className="account__item-meta">
                                                        <span>Кол-во: <strong>{item.quantity}</strong></span>
                                                        <span>Цена: <strong>{formatPrice(item.subtotal)} ₽</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="account__item-price">
                                                {formatPrice(item.total)} ₽
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="account__empty">Товары не найдены</p>
                            )}
                        </div>

                        <div className="account__calculations">
                            <h2 className="account__section-title">💰 Расчёт стоимости</h2>
                            <div className="account__calc-row">
                                <span>Товары:</span>
                                <span>{formatPrice(order.subtotal)} ₽</span>
                            </div>
                            {order.discountTotal && parseFloat(order.discountTotal) > 0 && (
                                <div className="account__calc-row account__calc-row--discount">
                                    <span>Скидка:</span>
                                    <span>-{formatPrice(order.discountTotal)} ₽</span>
                                </div>
                            )}
                            {order.shippingTotal && parseFloat(order.shippingTotal) > 0 && (
                                <div className="account__calc-row">
                                    <span>Доставка:</span>
                                    <span>{formatPrice(order.shippingTotal)} ₽</span>
                                </div>
                            )}
                            <div className="account__calc-row account__calc-row--total">
                                <span>ИТОГО:</span>
                                <span>{formatPrice(order.total)} ₽</span>
                            </div>
                        </div>

                        {/* АДРЕСА */}
                        <div className="account__addresses">
                            <div className="account__address-block">
                                <h3 className="account__address-title">📍 Адрес доставки</h3>
                                <div className="account__address-content">
                                    {order.shipping ? (
                                        <>
                                            <p><strong>{order.shipping.firstName} {order.shipping.lastName}</strong></p>
                                            <p>{order.shipping.address1}</p>
                                            {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                                            <p>{order.shipping.postcode}, {order.shipping.city}</p>
                                            <p>{order.shipping.state}, {order.shipping.country}</p>
                                        </>
                                    ) : (
                                        <p className="account__empty">Не указана</p>
                                    )}
                                </div>
                            </div>

                            <div className="account__address-block">
                                <h3 className="account__address-title">💳 Адрес биллинга</h3>
                                <div className="account__address-content">
                                    {order.billing ? (
                                        <>
                                            <p><strong>{order.billing.firstName} {order.billing.lastName}</strong></p>
                                            <p>{order.billing.address1}</p>
                                            {order.billing.address2 && <p>{order.billing.address2}</p>}
                                            <p>{order.billing.postcode}, {order.billing.city}</p>
                                            <p>{order.billing.state}, {order.billing.country}</p>
                                            <p>📧 {order.billing.email}</p>
                                            <p>☎️ {order.billing.phone}</p>
                                        </>
                                    ) : (
                                        <p className="account__empty">Совпадает с адресом доставки</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* СПОСОБ ОПЛАТЫ */}
                        {order.paymentMethodTitle && (
                            <div className="account__payment-method">
                                <h2 className="account__section-title">💳 Способ оплаты</h2>
                                <p className="account__payment-title">{order.paymentMethodTitle}</p>
                            </div>
                        )}

                        {/* ДЕЙСТВИЯ */}
                        <div className="account__actions">
                            <Link href="/account/orders" className="account__btn account__btn--secondary">
                                Вернуться к заказам
                            </Link>
                            <Link href="/account" className="account__btn account__btn--secondary">
                                В личный кабинет
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default OrderDetailPage;
