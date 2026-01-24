'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import './page.scss';
import Loader from '../../components/Loader';

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

    // ✅ ИЗМЕНЕНИЕ: Функция для расшифровки ошибок регистрации
    const getDetailedRegisterError = (errorCode, errorText) => {
        const errorMessages = {
            'validation_error': 'Ошибка валидации: ' + errorText,
            'username_exists': 'Это имя пользователя уже занято. Выберите другое.',
            'email_exists': 'Этот email уже зарегистрирован. Используйте другой или войдите в систему.',
            'registration_error': 'Ошибка при регистрации. ' + errorText,
            'invalid_json': 'Ошибка формата данных. Попробуйте еще раз.',
            'config_error': 'Ошибка конфигурации сервера.',
            'unexpected_response': 'Неожиданный ответ от сервера.',
            'server_error': 'Ошибка сервера. Попробуйте позже.',
        };

        // Если есть код ошибки, используем его
        if (errorMessages[errorCode]) {
            return errorMessages[errorCode];
        }

        // Иначе возвращаем текст как есть (от сервера)
        return errorText || 'Ошибка при регистрации. Попробуйте позже.';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // ✅ ИЗМЕНЕНИЕ: Очищаем ошибку при вводе
        if (localError) setLocalError('');
    };

    // ✅ ИЗМЕНЕНИЕ: Улучшенная валидация формы с подробными ошибками
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
        if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
            setLocalError('Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание');
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

        // ✅ ИЗМЕНЕНИЕ: Валидация формы на клиенте
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📝 Попытка регистрации:', formData.username, formData.email);

            // ✅ ИЗМЕНЕНИЕ: Улучшенная обработка ответа от сервера
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Ошибка регистрации:', data);

                // ✅ ИЗМЕНЕНИЕ: Обработка ошибок от сервера
                const errorMessage = getDetailedRegisterError(data.code, data.message);
                setLocalError(errorMessage);
                return;
            }

            if (data.success) {
                console.log('✅ Регистрация успешна:', data.user);

                // ✅ ИЗМЕНЕНИЕ: Редирект после успешной регистрации
                setTimeout(() => {
                    console.log('🔄 Перенаправляем на /login/?registered=true');
                    router.push('/login/?registered=true');
                }, 500);
            }
        } catch (err) {
            console.error('❌ Ошибка регистрации:', err);
            setLocalError(
                err.message || 'Ошибка подключения к серверу. Проверьте интернет-соединение и попробуйте еще раз.'
            );
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
                        <Loader label="Загружаем" />
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
                    </p><br />
                    <p className="login__signup">
                        Забыли пароль?{' '}
                        <Link href="/register/">Восстановить</Link>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default Register;