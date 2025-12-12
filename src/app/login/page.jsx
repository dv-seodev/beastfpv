'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import './page.scss';

const Login = () => {
    const router = useRouter();
    const { login, loading, error, isAuthenticated, token } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [localError, setLocalError] = useState('');

    // 🔐 Проверяем если уже авторизован
    useEffect(() => {
        if (token) {
            console.log('✅ Пользователь уже авторизован, редирект на /account/');
            router.push('/account/');
        }
    }, [token, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        try {
            console.log('📝 Попытка входа:', formData.username);
            await login(formData.username, formData.password);
            console.log('✅ Вход успешен');

            // 🚀 Редирект на /account/ после успешного входа
            setTimeout(() => {
                console.log('🔄 Перенаправляем на /account/');
                router.push('/account/');
            }, 500);
        } catch (err) {
            console.error('❌ Ошибка входа:', err);
            setLocalError(err.message || 'Ошибка входа');
        }
    };

    return (
        <section className="login">
            <div className="container login__container">
                <div className="login__card">
                    <h1>Вход в аккаунт</h1>

                    {(error || localError) && (
                        <div className="login__error">{error || localError}</div>
                    )}

                    <form className="login__form" onSubmit={handleSubmit}>
                        <div className="login__field">
                            <label htmlFor="username">Имя пользователя или Email</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Введите имя пользователя"
                                autoComplete="username"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="login__field">
                            <label htmlFor="password">Пароль</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Введите пароль"
                                autoComplete="current-password"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login__submit"
                            disabled={loading}
                        >
                            {loading ? '⏳ Загрузка...' : '🔐 Войти'}
                        </button>
                    </form>

                    <p className="login__signup">
                        Нет аккаунта?{' '}
                        <Link href="/register">Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Login;
