'use client'

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useAuth } from "../../lib/useAuth";

const Account = () => {
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();
    const { data, loading: dataLoading, error } = useHomeData();

    // 🔐 Проверяем авторизацию
    useEffect(() => {
        if (!authLoading && !token) {
            console.log('❌ Пользователь не авторизован, редирект на /login/');
            router.push('/login/');
        }
    }, [token, authLoading, router]);

    // ⏳ Пока проверяется авторизация
    if (authLoading) {
        return <div className="container" style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка...</div>;
    }

    // ❌ Если не авторизован - ничего не показываем
    if (!token) {
        return null;
    }

    // ⏳ Пока загружаются данные
    if (dataLoading) return <div className="container" style={{ padding: '20px' }}>Загрузка данных...</div>;
    if (error) return <div className="container" style={{ padding: '20px' }}>Ошибка: {error.message}</div>;
    if (!data) return <div className="container" style={{ padding: '20px' }}>Нет данных</div>;

    const { new_products, pop_products, cats_list } = data;

    // ✅ Функция для выхода
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login/');
    };

    return (
        <section className="account">
            <div className="container account__container">
                <h1 className="account__header">Личный кабинет</h1>

                {/* 👤 Информация о пользователе */}
                {user && (
                    <div style={{
                        padding: '15px',
                        marginBottom: '20px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '8px',
                        borderLeft: '4px solid #2180a0'
                    }}>
                        <p style={{ margin: '5px 0' }}>
                            <strong>📧 Пользователь:</strong> {user.username}
                        </p>
                        {user.email && (
                            <p style={{ margin: '5px 0' }}>
                                <strong>✉️ Email:</strong> {user.email}
                            </p>
                        )}
                    </div>
                )}

                <div className="account__nav">
                    <Link className="account__links-item account__link-active" href="/account/">Заказы</Link>
                    <Link className="account__links-item" href="/account/profile/">Профиль</Link>
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

                <div className="account__orders-list">
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" alt="Товар" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                </div>

                <NewItems products={new_products} />
            </div>
        </section>
    );
}

export default Account;
