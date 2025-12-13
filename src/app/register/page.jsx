'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import './page.scss';

const Register = () => {
    const router = useRouter();
    const { user, token, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
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
        // Очищаем ошибку при вводе
        if (localError) setLocalError('');
    };

    const validateForm = () => {
        // Валидация username
        if (!formData.username.trim()) {
            setLocalError('Введите имя пользователя');
            return false;
        }
        if (formData.username.length < 3) {
            setLocalError('Имя пользователя должно содержать минимум 3 символа');
            return false;
        }

        // Валидация email
        if (!formData.email.trim()) {
            setLocalError('Введите email адрес');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setLocalError('Введите корректный email адрес');
            return false;
        }

        // Валидация пароля
        if (!formData.password) {
            setLocalError('Введите пароль');
            return false;
        }
        if (formData.password.length < 6) {
            setLocalError('Пароль должен содержать минимум 6 символов');
            return false;
        }

        // Проверка совпадения паролей
        if (formData.password !== formData.confirmPassword) {
            setLocalError('Пароли не совпадают');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        // Валидация формы
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📝 Попытка регистрации:', formData.username, formData.email);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка регистрации');
            }

            console.log('✅ Регистрация успешна:', data);

            // Перенаправляем на страницу логина с сообщением
            setTimeout(() => {
                console.log('🔄 Перенаправляем на /login/');
                router.push('/login/?registered=true');
            }, 500);

        } catch (err) {
            console.error('❌ Ошибка регистрации:', err);
            setLocalError(err.message || 'Ошибка регистрации. Попробуйте ещё раз.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ⏳ Пока проверяется авторизация
    if (authLoading) {
        return (
            <section className="register">
                <div className="container register__container">
                    <form className="register__form">
                        <p style={{ textAlign: 'center' }}>⏳ Загрузка...</p>
                    </form>
                </div>
            </section>
        );
    }

    return (
        <section className="register">
            <div className="container register__container">
                <div className="register__header">
                    <h2>Регистрация</h2>
                    <p>Создайте новый аккаунт</p>
                </div>

                <form className="register__form" onSubmit={handleSubmit}>
                    {localError && (
                        <div className="register__error">⚠️ {localError}</div>
                    )}

                    <p>Имя пользователя</p>
                    <input
                        className="register__form-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Введите имя пользователя"
                        autoComplete="username"
                        required
                        disabled={isSubmitting}
                    />

                    <p>Email адрес</p>
                    <input
                        className="register__form-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        autoComplete="email"
                        required
                        disabled={isSubmitting}
                    />

                    <p>Пароль</p>
                    <input
                        className="register__form-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Минимум 6 символов"
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                    />

                    <p>Подтвердите пароль</p>
                    <input
                        className="register__form-input"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Повторите пароль"
                        autoComplete="new-password"
                        required
                        disabled={isSubmitting}
                    />

                    <button
                        type="submit"
                        className="register__form-button-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '⏳ Регистрация...' : 'Зарегистрироваться'}
                    </button>

                    <p className="register__login">
                        Уже есть аккаунт?{' '}
                        <Link href="/login/">Войти</Link>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default Register;
