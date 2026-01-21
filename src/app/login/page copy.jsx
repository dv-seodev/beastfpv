'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import './page.scss';

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, token, isHydrated, loading: authLoading, login, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🔐 Редирект если уже авторизован
    useEffect(() => {
        if (isHydrated && token && user) {
            console.log('✅ Пользователь уже авторизован, редирект на /account/');
            router.push('/account/');
        }
    }, [isHydrated, token, user, router]);

    // ✅ Сообщение об успешной регистрации
    useEffect(() => {
        const registered = searchParams.get('registered');
        if (registered === 'true') {
            setSuccessMessage('✅ Регистрация прошла успешно! Теперь вы можете войти в систему.');
            console.log('✅ Показываем сообщение об успешной регистрации');
        }
    }, [searchParams]);

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
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            console.log('📝 Попытка входа:', formData.username);

            // ✅ Вызываем функцию входа из хука
            await login(formData.username, formData.password);

            console.log('✅ Вход успешен, токен получен');

            // ✅ Редирект после успешного входа
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

    // ⏳ Пока проверяется гидрация
    if (!isHydrated || authLoading) {
        return (
            <section className="login">
                <div className="container login__container">
                    <form className="login__form">
                        <p style={{ textAlign: 'center' }}>⏳ Загрузка...</p>
                    </form>
                </div>
            </section>
        );
    }

    return (
        <section className="login">
            <div className="container login__container">
                <div className="login__header">
                    <h2>Вход в аккаунт</h2>
                    <p>Войдите в свой личный кабинет</p>
                </div>

                <form className="login__form" onSubmit={handleSubmit}>
                    {/* ✅ Сообщение об успешной регистрации */}
                    {successMessage && (
                        <div className="login__success">{successMessage}</div>
                    )}

                    {/* ❌ Сообщение об ошибке */}
                    {(localError || authError) && (
                        <div className="login__error">
                            ⚠️ {localError || authError}
                        </div>
                    )}

                    <p>Имя пользователя или Email</p>
                    <input
                        className="login__form-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Введите имя пользователя или email"
                        autoComplete="username"
                        required
                        disabled={isSubmitting}
                    />

                    <p>Пароль</p>
                    <input
                        className="login__form-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Введите пароль"
                        autoComplete="current-password"
                        required
                        disabled={isSubmitting}
                    />

                    <button
                        type="submit"
                        className="login__form-button-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '⏳ Вход...' : 'Войти'}
                    </button>

                    <p className="login__signup">
                        Нет аккаунта?{' '}
                        <Link href="/register/">Зарегистрироваться</Link>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default Login;
