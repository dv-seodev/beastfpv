'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '../../../account/page.scss';
import { useAuth } from '../../../../lib/useAuth';

const INVOICE_META_KEYS = [
    '_bacs_invoice_url',
    'bacs_invoice_url',
    '_invoice_url',
    'invoice_url',
];

const resolveInvoiceUrl = (orderData) => {
    if (orderData?.invoice_url) {
        return String(orderData.invoice_url).trim();
    }

    if (Array.isArray(orderData?.meta_data)) {
        for (const key of INVOICE_META_KEYS) {
            const invoiceMeta = orderData.meta_data.find(
                (meta) => meta?.key === key && meta?.value
            );
            if (invoiceMeta?.value) {
                return String(invoiceMeta.value).trim();
            }
        }
    }

    return null;
};

const isBankTransferOrder = (orderData) => {
    const methodId = String(orderData?.payment_method || '').toLowerCase();
    const methodTitle = String(orderData?.payment_method_title || '').toLowerCase();

    if (methodId === 'bacs' || methodId === 'bank_transfer') {
        return true;
    }

    return methodTitle.includes('расчетн');
};

const OrderSuccessPage = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const { token, isHydrated, isAuthenticated } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoiceUrl, setInvoiceUrl] = useState(null);

    useEffect(() => {
        if (!params.orderId) return;
        if (!isHydrated) return;

        const orderKey = searchParams.get('order_key') || searchParams.get('key');

        // нет ключа и не залогинен → уводим на логин
        if (!orderKey && !isAuthenticated) {
            // const next = `${window.location.pathname}${window.location.search}`;
            router.push(`/login/`);
            return;
        }

        fetchOrderDetails(orderKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.orderId, isHydrated, token, searchParams]);

    const fetchOrderDetails = async (orderKey) => {
        try {
            setLoading(true);
            setError(null);

            const orderId = params.orderId;

            const url = orderKey
                ? `/api/orders/${orderId}?order_key=${encodeURIComponent(orderKey)}`
                : `/api/orders/${orderId}`;

            const headers = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            const response = await fetch(url, { method: 'GET', headers });

            if (!response.ok) {
                if (response.status === 404) throw new Error('Заказ не найден');
                if (response.status === 401) throw new Error('Нужно войти в аккаунт');
                if (response.status === 403) throw new Error('Нет доступа к этому заказу');
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const order = await response.json();
            setOrder(order);

            if (isBankTransferOrder(order)) {
                setInvoiceUrl(resolveInvoiceUrl(order));
            } else {
                setInvoiceUrl(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPriceForDisplay = (price) => {
        if (!price) return '0 ₽';

        let numPrice;
        if (typeof price === 'string') {
            numPrice = parseFloat(price.replace(/[^\d.]/g, ''));
        } else {
            numPrice = parseFloat(price);
        }

        if (isNaN(numPrice)) return price;
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

    if (loading) {
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
                    <Link href="/" className="account__back-link">
                        ← На главную
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
                    <Link href="/" className="account__back-link">
                        ← На главную
                    </Link>
                </div>
            </section>
        );
    }

    const statusInfo = getStatusBadge(order.status);
    const orderItems = order.line_items || [];

    return (
        <section className="account-order">
            <div className="container account__container">
                <section className="account__section">
                    <div className="account__container">
                        <Link href="/" className="account__back-link">
                            ← На главную
                        </Link>

                        {/* ЗАГОЛОВОК */}
                        <div className="account__success-header" style={{ textAlign: 'center', lineHeight: '26px', marginBottom: '20px', padding: '20px' }}>
                            <div style={{ fontSize: '48px', paddingBottom: '20px' }}>✅</div>
                            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Заказ успешно оформлен!</h1>
                            <p style={{ fontSize: '16px', color: '#666' }}>
                                Благодарим за оказанное доверие! Номер вашего заказа: <strong>#{order.number}</strong>
                            </p>
                            <br />
                            {isBankTransferOrder(order) && invoiceUrl && (
                                <h3>
                                    <Link href={invoiceUrl} download>
                                        📄 Скачать счёт на оплату
                                    </Link>
                                </h3>
                            )}
                        </div>

                        <div className="account__header">
                            <h1 className="account__title">Заказ #{order.number}</h1>
                            <p className="account__subtitle">
                                📅   {new Date(order.date_created).toLocaleDateString('ru-RU', {
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
                                <span className="account__total-label">Итог:</span>
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
                                                        href={`/product/${item.slug || item.product_id}`}
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
                                    <p className="account__address-content"><b>{order.payment_method_title}</b></p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default OrderSuccessPage;
