import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WP_REST_USER = process.env.WP_REST_USER;
const WP_REST_PASSWORD = process.env.WP_REST_PASSWORD || process.env.WOOCOMMERCE_APP_PASSWORD;

const translateForgotPasswordError = (errorMessage) => {
    const errorMap = {
        'invalid email': 'Введите корректный email адрес.',
        'email address is unknown': 'Пользователь с таким email не найден в системе.',
        'user not found': 'Пользователь с таким email не найден в системе.',
        'invalid parameter': 'Невалидные параметры запроса.',
        'rest_no_route': 'На сервере недоступен маршрут восстановления пароля.',
        'rest_forbidden': 'Доступ запрещен. Проверьте учетные данные для WordPress REST API.',
        'rate_limited': 'Слишком много попыток. Попробуйте позже.',
    };

    const lowerError = errorMessage?.toLowerCase() || '';
    for (const [key, value] of Object.entries(errorMap)) {
        if (lowerError.includes(key)) {
            return value;
        }
    }

    return errorMessage || 'Ошибка при восстановлении пароля. Попробуйте позже.';
};

const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email адрес обязателен' };
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { valid: false, error: 'Введите корректный email адрес' };
    }

    return { valid: true, email: trimmedEmail };
};

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const resetPasswordViaWordPress = async (email) => {
    const endpoint = `${WORDPRESS_URL}/wp-json/beastfpv/v1/password/reset`;
    const credentials = Buffer.from(`${WP_REST_USER}:${WP_REST_PASSWORD}`).toString('base64');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ email }),
    });

    const data = await safeJson(response);
    return { response, data };
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        console.log('📧 Запрос на восстановление пароля (авто-выдача нового пароля)');

        const validation = validateEmail(email);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    success: false,
                    message: validation.error,
                    code: 'validation_error',
                },
                { status: 400 }
            );
        }

        if (!WORDPRESS_URL) {
            console.error('🔴 NEXT_PUBLIC_WORDPRESS_URL не установлен');
            return NextResponse.json(
                {
                    success: false,
                    message: 'Ошибка конфигурации сервера',
                    code: 'config_error',
                },
                { status: 500 }
            );
        }

        if (!WP_REST_USER || !WP_REST_PASSWORD) {
            console.error('🔴 WP_REST_USER/WP_REST_PASSWORD не установлены (или WOOCOMMERCE_APP_PASSWORD)');
            return NextResponse.json(
                {
                    success: false,
                    message: 'Ошибка конфигурации сервера',
                    code: 'config_error',
                },
                { status: 500 }
            );
        }

        const normalizedEmail = validation.email;

        const { response, data } = await resetPasswordViaWordPress(normalizedEmail);

        // Не раскрываем существование email, но если WP вернул rate limit/forbidden - покажем ошибку.
        if (response.status === 429 || data?.code === 'rate_limited') {
            return NextResponse.json(
                {
                    success: false,
                    message: translateForgotPasswordError('rate_limited'),
                    code: 'rate_limited',
                },
                { status: 429 }
            );
        }

        if (response.status === 403 || response.status === 401) {
            return NextResponse.json(
                {
                    success: false,
                    message: translateForgotPasswordError('rest_forbidden'),
                    code: 'rest_forbidden',
                },
                { status: 403 }
            );
        }

        if (!response.ok) {
            console.warn('⚠️ WordPress reset endpoint returned non-OK:', response.status, data?.code || data);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Если такой email существует, на него будет отправлен новый пароль. Проверьте почту и папку спам.',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ Ошибка сервера при восстановлении пароля:', error.message);
        console.error('Stack:', error.stack);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Ошибка формата данных',
                    code: 'invalid_json',
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Произошла ошибка на сервере. Попробуйте позже.',
                code: 'server_error',
            },
            { status: 500 }
        );
    }
}
