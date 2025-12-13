'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import '../page.scss';
import { useAuth } from "../../../lib/useAuth";

const OrdersPage = () => {
    const router = useRouter();
    const { user, token, loading: authLoading, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🔐 Проверка авторизации');
        console.log('👤 User:', user);
        console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

        if (!authLoading && !token) {
            console.log('❌ Не авторизован, редирект');
            router.push('/login/');
        }
    }, [token, authLoading, router]);

    useEffect(() => {
        if (!authLoading && token) {
            console.log('📦 Загружаем заказы');
            fetchOrders();
        }
    }, [authLoading, token]);

    const fetchOrders = async () => {
        try {
            console.log('🔑 Отправляем запрос с токеном');

            const response = await fetch('/api/auth/orders', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('📊 Статус ответа:', response.status);

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Данные получены:', result);
            console.log('📦 Количество заказов:', result.orders?.length || 0);

            setOrders(result.orders || []);
        } catch (error) {
            console.error('❌ Ошибка загрузки заказов:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="container" style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка...</div>;
    }

    if (!token) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login/');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        // ✨ Нормализуем статус (ON_HOLD → on-hold)
        const normalizedStatus = status?.toLowerCase().replace(/_/g, '-');

        const statusMap = {
            'completed': { text: '✅ Завершён', color: '#4caf50' },
            'processing': { text: '⏳ Обработка', color: '#ff9800' },
            'pending': { text: '⏱️ Ожидание', color: '#2196f3' },
            'on-hold': { text: '⏸️ На удержании', color: '#ff9800' },
            'cancelled': { text: '❌ Отменён', color: '#f44336' },
            'refunded': { text: '💸 Возврат', color: '#9c27b0' },
            'failed': { text: '❌ Ошибка', color: '#f44336' },
        };

        const statusInfo = statusMap[normalizedStatus] || { text: status, color: '#999' };

        return (
            <span style={{
                display: 'inline-block',
                padding: '5px 10px',
                backgroundColor: statusInfo.color,
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {statusInfo.text}
            </span>
        );
    };

    // ✨ Улучшенная функция formatPrice
    const formatPrice = (price) => {
        if (!price) return '0 ₽';

        // Если это строка с HTML entities (как "1 040,00&nbsp;₽")
        if (typeof price === 'string') {
            // Убираем HTML entities и извлекаем число
            const cleanPrice = price
                .replace(/&nbsp;/g, '')
                .replace(/₽/g, '')
                .replace(/\s/g, '')
                .replace(',', '.');

            const numPrice = parseFloat(cleanPrice);

            if (!isNaN(numPrice)) {
                return numPrice.toLocaleString('ru-RU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + ' ₽';
            }

            // Если не смогли распарсить, возвращаем как есть
            return price;
        }

        // Если это число
        return parseFloat(price).toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' ₽';
    };

    return (
        <section className="account">
            <div className="container account__container">
                <h1 className="account__header">Личный кабинет</h1>

                <div className="account__nav">
                    <Link className="account__links-item" href="/account/">Профиль</Link>
                    <Link className="account__links-item account__link-active" href="/account/orders/">Заказы</Link>
                    <button
                        className="account__links-item"
                        onClick={handleLogout}>
                        Выйти
                    </button>
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3>Всего заказов ({orders.length})</h3>

                    {error && (
                        <div style={{
                            padding: '15px',
                            marginTop: '15px',
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            borderRadius: '4px',
                            borderLeft: '4px solid #ffc107'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка заказов...</div>
                    ) : orders.length === 0 ? (
                        <div style={{
                            padding: '20px',
                            marginTop: '15px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            📭 У вас пока нет заказов
                        </div>
                    ) : (
                        <div className="account__orders-list" style={{ marginTop: '20px' }}>
                            {orders.map((order) => {
                                // ✨ Правильная структура GraphQL: lineItems.nodes
                                const lineItems = order.lineItems?.nodes || [];

                                console.log('📦 Order:', order.orderNumber, 'Items:', lineItems.length);

                                return (
                                    <div
                                        key={order.id}
                                        className="account__order-item"
                                        style={{
                                            padding: '15px',
                                            marginBottom: '15px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '8px',
                                            border: '1px solid #eee'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '10px',
                                            flexWrap: 'wrap',
                                            gap: '10px'
                                        }}>
                                            <h3 style={{ margin: 0 }}>
                                                Заказ {order.orderNumber || `#${order.databaseId}`}
                                            </h3>
                                            {getStatusBadge(order.status)}
                                        </div>

                                        <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                            📅 {formatDate(order.date)}
                                        </p>

                                        <div style={{
                                            marginTop: '10px',
                                            paddingTop: '10px',
                                            borderTop: '1px solid #ddd'
                                        }}>
                                            <h4 style={{ margin: '5px 0' }}>Товары:</h4>
                                            {lineItems.length > 0 ? (
                                                lineItems.map((item, idx) => {
                                                    // ✨ Правильная структура: item.product.node
                                                    const productName = item.product?.node?.name || 'Товар';

                                                    return (
                                                        <div key={idx} style={{
                                                            padding: '8px 0',
                                                            fontSize: '14px'
                                                        }}>
                                                            <p style={{ margin: '3px 0' }}>
                                                                • {productName} × {item.quantity}
                                                            </p>
                                                            <p style={{ margin: '3px 0', color: '#2180a0', fontWeight: 'bold' }}>
                                                                {formatPrice(item.total)}
                                                            </p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p style={{ color: '#999' }}>Товары не найдены</p>
                                            )}
                                        </div>

                                        <div style={{
                                            marginTop: '10px',
                                            paddingTop: '10px',
                                            borderTop: '1px solid #ddd',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontSize: '14px', color: '#666' }}>
                                                💰 Итого:
                                            </span>
                                            <span style={{
                                                fontSize: '18px',
                                                fontWeight: 'bold',
                                                color: '#2180a0'
                                            }}>
                                                {formatPrice(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default OrdersPage;
