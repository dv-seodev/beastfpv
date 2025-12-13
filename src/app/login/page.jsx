'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import './page.scss';

const Login = () => {
    const router = useRouter();
    const { user, token, loading: authLoading, login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🔐 Проверяем если уже авторизован
    useEffect(() => {
        if (token && user) {
            console.log('✅ Пользователь уже авторизован, редирект на /account/');
            router.push('/account/');
        }
    }, [token, user, router]);

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
        setIsSubmitting(true);

        try {
            console.log('📝 Попытка входа:', formData.username);

            // ✨ Вызываем функцию login из useAuth
            await login(formData.username, formData.password);

            console.log('✅ Вход успешен, токен получен');

            // 🚀 Редирект на /account/ после успешного входа
            setTimeout(() => {
                console.log('🔄 Перенаправляем на /account/');
                router.push('/account/');
            }, 500);
        } catch (err) {
            console.error('❌ Ошибка входа:', err);
            setLocalError(err.message || 'Ошибка входа. Проверьте учётные данные.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ⏳ Пока проверяется авторизация
    if (authLoading) {
        return (
            <section className="login">
                <div className="container login__container">
                    <div className="login__card">
                        <p style={{ textAlign: 'center' }}>⏳ Загрузка...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="login">
            <div className="container login__container">
                <div className="login__card">
                    <h1>Вход в аккаунт</h1>

                    {localError && (
                        <div className="login__error">⚠️ {localError}</div>
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
                                placeholder="Введите имя пользователя или email"
                                autoComplete="username"
                                required
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login__submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '⏳ Загрузка...' : '🔐 Войти'}
                        </button>
                    </form>

                    <p className="login__signup">
                        Нет аккаунта?{' '}
                        <Link href="/register/">Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Login;
