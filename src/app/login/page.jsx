'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import './page.scss';
import Loader from '../../components/Loader';

const Login = () => {
    const router = useRouter();
    // const searchParams = useSearchParams();
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
        const sp = new URLSearchParams(window.location.search);
        if (sp.get('registered') === 'true') {
            setSuccessMessage('✅ Регистрация прошла успешно! Теперь вы можете войти в систему.');
        }
    }, []);

    // ✅ ИЗМЕНЕНИЕ: Функция для расшифровки кодов ошибок
    const getDetailedErrorMessage = (errorCode, errorText) => {
        const errorMessages = {
            // Ошибки валидации
            'invalid_credentials': 'Неверное имя пользователя или пароль. Попробуйте еще раз.',
            'invalid_json': 'Ошибка формата данных. Попробуйте отправить форму еще раз.',
            'service_unavailable': 'Сервис временно недоступен. Попробуйте позже.',
            'server_error': 'Внутренняя ошибка сервера. Наша команда уже работает над исправлением. Попробуйте позже.',
            'user_not_found': 'Пользователь с таким именем пользователя или email не найден.',
            'access_denied': 'У вас нет прав доступа. Свяжитесь с администратором.',
        };

        // Если есть код ошибки, используем его
        if (errorMessages[errorCode]) {
            return errorMessages[errorCode];
        }

        // Иначе возвращаем текст как есть (от сервера)
        return errorText || 'Попробуйте еще раз или свяжитесь с поддержкой.';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // ✅ ИЗМЕНЕНИЕ: Очищаем ошибки при изменении поля
        setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ ИЗМЕНЕНИЕ: Очищаем предыдущие ошибки
        setLocalError('');
        setSuccessMessage('');

        // ✅ ИЗМЕНЕНИЕ: Базовая валидация на клиенте
        if (!formData.username.trim()) {
            setLocalError('Введите имя пользователя или email');
            return;
        }

        if (!formData.password) {
            setLocalError('Введите пароль');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📝 Попытка входа:', formData.username);

            // ✅ ИЗМЕНЕНИЕ: Вызываем API напрямую с улучшенной обработкой ошибок
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // ✅ ИЗМЕНЕНИЕ: Обработка ошибок от сервера
                console.error('❌ Ошибка входа:', data);

                const errorMessage = getDetailedErrorMessage(data.code, data.error);
                setLocalError(errorMessage);
                return;
            }

            if (data.success) {
                console.log('✅ Вход успешен, токен получен');

                // ✅ ИЗМЕНЕНИЕ: Вызываем функцию входа из хука (если она используется)
                if (login) {
                    await login(formData.username, formData.password);
                }

                // ✅ ИЗМЕНЕНИЕ: Редирект после успешного входа
                setTimeout(() => {
                    console.log('🔄 Перенаправляем на /account/');
                    router.push('/account/');
                }, 500);
            }
        } catch (err) {
            console.error('❌ Ошибка сети:', err);
            setLocalError(
                'Ошибка подключения к серверу. Проверьте интернет-соединение и попробуйте еще раз.'
            );
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
                        <Loader label="Загружаем" />
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

                    {/* ✅ Сообщение об ошибке */}
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

export default Login;