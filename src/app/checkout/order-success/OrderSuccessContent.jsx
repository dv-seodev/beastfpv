"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRestCart } from "../../../lib/hooks/useRestCart";
import wooRestApi from "../../../lib/woo_rest_api/rest_api";
import "./page.scss";

const OrderSuccessContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");

    const { handleClearCart } = useRestCart();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            setError("ID заказа не найден");
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const orderData = await wooRestApi.getOrder(orderId);
                setOrder(orderData);
                await handleClearCart();
            } catch (err) {
                setError(err.message || "Не удалось загрузить заказ");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, handleClearCart]);

    const getStatusLabel = (status) => {
        const labels = {
            pending: "⏳ Ожидание оплаты",
            processing: "🚚 Обработка",
            completed: "✅ Завершен",
            cancelled: "❌ Отменен",
            failed: "⚠️ Ошибка",
            "on-hold": "🔔 На удержании",
            refunded: "💰 Возвращено",
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) =>
        `order-success__status order-success__status--${status}`;

    const formatPrice = (price) =>
        parseFloat(price).toLocaleString("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

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

    if (error || !order) {
        return (
            <section className="order-success">
                <div className="container order-success__container">
                    <div className="order-success__error">
                        <h2>⚠️ Ошибка</h2>
                        <p>{error || "Заказ не найден"}</p>
                        <div className="order-success__actions">
                            <Link
                                href="/"
                                className="order-success__btn order-success__btn--primary"
                            >
                                На главную
                            </Link>
                            <Link
                                href="/cart/"
                                className="order-success__btn order-success__btn--secondary"
                            >
                                В корзину
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // дальше оставляешь твой SUCCESS STATE как есть
    return (
        <section className="order-success">
            {/* ...весь остальной JSX из твоего компонента... */}
        </section>
    );
};

export default OrderSuccessContent;
