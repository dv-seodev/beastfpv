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
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔐 Проверяем авторизацию
    useEffect(() => {
        if (!authLoading && !token) {
            console.log('❌ Пользователь не авторизован, редирект на /login/');
            router.push('/login/');
        }
    }, [token, authLoading, router]);

    // 📦 Загружаем заказы
    useEffect(() => {
        if (token && user) {
            fetchOrders();
        }
    }, [token, user]);

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            setError(null);

            console.log(`📦 Загружаем заказы через GraphQL`);

            // ✅ Используем /api/auth/orders (переделан на GraphQL)
            const response = await fetch(
                `/api/auth/orders?customer=${user.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(`📊 Статус ответа: ${response.status}`);

            if (!response.ok) {
                throw new Error(`Ошибка загрузки заказов: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Заказы загружены:', data);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('❌ Ошибка при загрузке заказов:', err);
            setError(err.message);
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };



    // ⏳ Пока проверяется авторизация
    if (authLoading) {
        return <div className="container" style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка...</div>;
    }

    // ❌ Если не авторизован - ничего не показываем
    if (!token) {
        return null;
    }

    // ✅ Функция для выхода
    const handleLogout = () => {
        logout();
        router.push('/login/');
    };

    // 📅 Форматируем дату
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

    // 🎨 Статус заказа
    const getStatusBadge = (status) => {
        const statusMap = {
            'completed': { text: '✅ Завершён', color: '#4caf50' },
            'processing': { text: '⏳ Обработка', color: '#ff9800' },
            'pending': { text: '⏱️ Ожидание', color: '#2196f3' },
            'cancelled': { text: '❌ Отменён', color: '#f44336' },
        };

        const statusInfo = statusMap[status] || { text: status, color: '#999' };

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

    return (
        <section className="account">
            <div className="container account__container">
                <h1 className="account__header">Личный кабинет</h1>

                <div className="account__nav">
                    <Link className="account__links-item" href="/account/">Профиль</Link>
                    <Link className="account__links-item account__link-active" href="/account/orders/">Заказы</Link>
                    <button
                        className="account__links-item"
                        onClick={handleLogout}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 'inherit',
                            font: 'inherit',
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >
                        🚪 Выйти
                    </button>
                </div>

                {/* 📦 Список заказов */}
                <div style={{ marginTop: '30px' }}>
                    <h2>📦 Мои заказы ({orders.length})</h2>

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

                    {ordersLoading ? (
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
                            {orders.map((order) => (
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
                                        marginBottom: '10px'
                                    }}>
                                        <h3 style={{ margin: 0 }}>Заказ {order.order_number || `#${order.id}`}</h3>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                                        📅 {formatDate(order.date_created)}
                                    </p>

                                    <div style={{
                                        marginTop: '10px',
                                        paddingTop: '10px',
                                        borderTop: '1px solid #ddd'
                                    }}>
                                        <h4 style={{ margin: '5px 0' }}>Товары:</h4>
                                        {order.line_items && order.line_items.map((item, idx) => (
                                            <div key={idx} style={{
                                                padding: '8px 0',
                                                fontSize: '14px'
                                            }}>
                                                <p style={{ margin: '3px 0' }}>
                                                    • {item.name} x{item.quantity}
                                                </p>
                                                <p style={{ margin: '3px 0', color: '#2180a0', fontWeight: 'bold' }}>
                                                    {parseFloat(item.price).toLocaleString('ru-RU')} ₽
                                                </p>
                                            </div>
                                        ))}
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
                                            {parseFloat(order.total).toLocaleString('ru-RU')} ₽
                                        </span>
                                    </div>

                                    <button style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#2180a0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}>
                                        📋 Подробнее
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default OrdersPage;
