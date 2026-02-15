'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../login/page.scss';

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ ИЗМЕНЕНИЕ: Функция для расшифровки ошибок восстановления пароля
    const getDetailedErrorMessage = (errorCode, errorText) => {
        const errorMessages = {
            'user_not_found': 'Пользователь с таким email не найден в системе.',
            'invalid_email': 'Введите корректный email адрес.',
            'email_required': 'Email адрес обязателен.',
            'validation_error': 'Ошибка валидации: ' + errorText,
            'config_error': 'Ошибка конфигурации сервера.',
            'rest_no_route': 'Маршрут восстановления пароля недоступен на сервере.',
            'reset_error': 'Ошибка при восстановлении пароля. ' + errorText,
            'server_error': 'Ошибка сервера. Попробуйте позже.',
        };

        if (errorMessages[errorCode]) {
            return errorMessages[errorCode];
        }

        return errorText || 'Ошибка при восстановлении пароля. Попробуйте позже.';
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (localError) setLocalError('');
    };

    // ✅ ИЗМЕНЕНИЕ: Отправка email для восстановления пароля и автоматической генерации нового
    const handleSendReset = async (e) => {
        e.preventDefault();
        setLocalError('');
        setSuccessMessage('');

        // Валидация email
        if (!email.trim()) {
            setLocalError('Введите email адрес');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setLocalError('Введите корректный email адрес');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('📧 Отправляем запрос восстановления пароля на:', email);

            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Ошибка:', data);
                const errorMessage = getDetailedErrorMessage(data.code, data.message);
                setLocalError(errorMessage);
                return;
            }

            if (data.success) {
                console.log('✅ Запрос на восстановление пароля выполнен');
                setSuccessMessage(
                    data.message ||
                    '✅ Письмо для восстановления пароля отправлено. Проверьте вашу почту и папку спам.'
                );
                setEmail('');

                // Редирект на логин через 5 секунд
                setTimeout(() => {
                    router.push('/login/');
                }, 5000);
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

    return (
        <section className="login">
            <div className="container login__container">
                <div className="login__header">
                    <h2>Восстановление пароля</h2>
                    <p>Введите email вашего аккаунта</p>
                </div>

                <form className="login__form" onSubmit={handleSendReset}>
                    {/* ✅ Сообщение об успехе */}
                    {successMessage && (
                        <div className="login__success">{successMessage}</div>
                    )}

                    {/* ✅ Сообщение об ошибке */}
                    {localError && (
                        <div className="login__error">
                            ⚠️ {localError}
                        </div>
                    )}

                    <p>Email адрес</p>
                    <input
                        className="login__form-input"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Введите ваш email"
                        autoComplete="email"
                        required
                        disabled={isSubmitting}
                    />

                    <button
                        type="submit"
                        className="login__form-button-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '⏳ Отправка...' : 'Отправить новый пароль'}
                    </button>

                    <p className="login__signup">
                        Вспомнили пароль?{' '}
                        <Link href="/login/">Войти</Link>
                    </p>
                </form>
            </div>
        </section>
    );
};

export default ForgotPassword;
