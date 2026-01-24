'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../lib/useAuth';
import Link from 'next/link';
import '../../page.scss';
import Loader from '../../../../components/Loader';

const OrderDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { user, token, loading: authLoading } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceUrl, setInvoiceUrl] = useState(null);

    useEffect(() => {
        if (authLoading) return <Loader label="Загружаем" />;
        if (!user) {
            router.push('/login');
            return;
        }
        if (!params.orderId) return; // ← Проверяем, что orderId загружен
        fetchOrderDetails();
    }, [user, token, authLoading, params.orderId]); // ← ДОБАВЛЕНА зависимость params.orderId

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const orderId = params.orderId;
            console.log('🔍 Loading order:', orderId); // ← Логирование для отладки

            const response = await fetch(
                `/api/auth/orders/${orderId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('📡 Backend API Response status:', response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Заказ не найден');
                }
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const order = await response.json();

            console.log('✅ Order loaded:', order);
            setOrder(order);

            if (order.payment_method === 'bacs' && Array.isArray(order.meta_data)) {
                const invoiceMeta = order.meta_data.find(
                    (meta) => meta.key === '_bacs_invoice_url'
                );
                if (invoiceMeta?.value) {
                    setInvoiceUrl(invoiceMeta.value);
                }
            }
        } catch (err) {
            console.error('🔴 Error loading order:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPriceForDisplay = (price) => {
        if (!price) return '0 ₽';

        // Парсим цену в число
        let numPrice;

        if (typeof price === 'string') {
            // Убираем все кроме цифр и точки
            numPrice = parseFloat(price.replace(/[^\d.]/g, ''));
        } else {
            numPrice = parseFloat(price);
        }

        // Если не число, возвращаем оригинальное значение
        if (isNaN(numPrice)) return price;

        // Форматируем с пробелом как разделитель тысяч
        return numPrice.toLocaleString('ru-RU') + ' ₽';
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
    const orderItems = order.line_items || [];

    console.log('orderItems - ', orderItems);

    const getProductSlug = async (productId) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/products/${productId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );
            const product = await response.json();
            return product.slug;
        } catch (err) {
            console.error('Error fetching product slug:', err);
            return productId;
        }
    };

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
                            <h1 className="account__title">Заказ #{order.number}</h1>
                            <p className="account__subtitle">
                                📅 {new Date(order.date_created).toLocaleDateString('ru-RU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        {order.payment_method === 'bacs' && invoiceUrl && (
                            <h3 style={{ marginBottom: '20px' }}>
                                <Link href={invoiceUrl} download>
                                    📄 Скачать счёт на оплату
                                </Link>
                            </h3>
                        )}

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
                                    {formatPriceForDisplay(order.total)}
                                </span>
                            </div>
                        </div>

                        {/* ТОВАРЫ */}
                        <div className="account__order-items">
                            <h2 className="account__section-title">Товары в заказе</h2>
                            {orderItems.length > 0 ? (
                                <div className="account__items-list">
                                    {orderItems.map((item) => (
                                        <div key={item.product_id} className="account__order-detail-item">
                                            <div className="account__item-info">
                                                <div className="account__item-image">
                                                    {item.image?.src && (
                                                        <img
                                                            src={item.image.src}
                                                            alt={item.name}
                                                        />
                                                    )}
                                                </div>
                                                <div className="account__item-details">
                                                    <Link
                                                        href={`/product/${item.slug}`}
                                                        className="account__item-name"
                                                    >
                                                        {item.name || 'Товар'}
                                                    </Link>
                                                    <div className="account__item-meta">
                                                        <span>Кол-во: <strong>{item.quantity}</strong></span>
                                                        <span>Цена: <strong>{formatPriceForDisplay(item.subtotal)}</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="account__item-price">
                                                {formatPriceForDisplay(item.total)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="account__empty">Товары не найдены</p>
                            )}
                        </div>

                        {/* АДРЕСА */}
                        <div className="account__addresses">
                            <div className="account__address-block">
                                <h3 className="account__address-title">📍 Адрес доставки</h3>
                                <div className="account__address-content">
                                    {order.shipping ? (
                                        <>
                                            <p><strong>{order.shipping.first_name} {order.shipping.last_name}</strong></p>
                                            <p>{order.shipping.address_1}</p>
                                            {order.shipping.address_2 && <p>{order.shipping.address_2}</p>}
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
                                            <p><strong>{order.billing.first_name} {order.billing.last_name}</strong></p>
                                            <p>{order.billing.address_1}</p>
                                            {order.billing.address_2 && <p>{order.billing.address_2}</p>}
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

                            {/* СПОСОБ ОПЛАТЫ */}
                            {order.payment_method_title && (
                                <div className="account__address-block">
                                    <h3 className="account__address-title">💳 Способ оплаты</h3>
                                    <p className="aaccount__address-content">{order.payment_method_title}</p>
                                </div>
                            )}
                        </div>


                    </div>
                </section>
            </div >
        </section >
    );
};

export default OrderDetailPage;
