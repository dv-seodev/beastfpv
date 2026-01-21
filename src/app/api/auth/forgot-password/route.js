
forgot_password_route_no_nodemailer.js
import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

// ✅ ИЗМЕНЕНИЕ: Функция для расшифровки ошибок восстановления пароля
const translateForgotPasswordError = (errorMessage) => {
    const errorMap = {
        'user not found': 'Пользователь с таким email не найден в системе.',
        'invalid email': 'Введите корректный email адрес.',
        'email already registered': 'Этот email уже зарегистрирован.',
        'invalid token': 'Ссылка для восстановления пароля истекла или невалидна.',
        'password too short': 'Пароль должен содержать минимум 6 символов.',
        'password weak': 'Пароль слишком простой. Используйте буквы, цифры и символы.',
    };

    const lowerError = errorMessage?.toLowerCase() || '';
    for (const [key, value] of Object.entries(errorMap)) {
        if (lowerError.includes(key.toLowerCase())) {
            return value;
        }
    }

    return errorMessage || 'Ошибка при восстановлении пароля. Попробуйте позже.';
};

// ✅ ИЗМЕНЕНИЕ: Функция валидации email
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email адрес обязателен' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { valid: false, error: 'Введите корректный email адрес' };
    }

    return { valid: true };
};

// ✅ ИЗМЕНЕНИЕ: Функция для генерации случайного пароля
const generateTemporaryPassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        console.log('📧 Запрос на восстановление пароля для:', email);

        // ✅ ИЗМЕНЕНИЕ: Валидация email
        const validation = validateEmail(email);
        if (!validation.valid) {
            console.log('❌ Ошибка валидации:', validation.error);
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

        // ✅ ИЗМЕНЕНИЕ: Генерируем новый временный пароль
        const newPassword = generateTemporaryPassword();
        console.log('🔑 Новый пароль сгенерирован');

        // ✅ ИЗМЕНЕНИЕ: GraphQL мутация для поиска пользователя по email и смены пароля
        const graphqlQuery = `
            mutation {
                updateUserPasswordByEmail(
                    input: {
                        email: "${email.trim()}"
                        password: "${newPassword}"
                    }
                ) {
                    user {
                        databaseId
                        username
                        email
                        firstName
                        lastName
                    }
                    success
                    message
                }
            }
        `;

        console.log('🔄 Отправляем GraphQL запрос на смену пароля...');

        const response = await fetch(`${WORDPRESS_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: graphqlQuery,
            }),
        });

        const data = await response.json();

        console.log('📥 Ответ от WordPress:', data.errors ? 'Ошибка' : 'Успех');

        // ✅ ИЗМЕНЕНИЕ: Обработка GraphQL ошибок
        if (data.errors && data.errors.length > 0) {
            console.error('❌ GraphQL ошибки:', data.errors);

            const errorMessage = data.errors[0]?.message || 'Ошибка при восстановлении пароля';
            const translatedError = translateForgotPasswordError(errorMessage);

            let errorCode = 'reset_error';
            if (errorMessage.toLowerCase().includes('not found')) {
                errorCode = 'user_not_found';
            } else if (errorMessage.toLowerCase().includes('invalid')) {
                errorCode = 'invalid_email';
            }

            return NextResponse.json(
                {
                    success: false,
                    message: translatedError,
                    code: errorCode,
                },
                { status: 400 }
            );
        }

        if (!data.data || !data.data.updateUserPasswordByEmail) {
            console.error('❌ Неожиданный ответ от WordPress:', data);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Ошибка при смене пароля. Попробуйте позже.',
                    code: 'unexpected_response',
                },
                { status: 500 }
            );
        }

        const userData = data.data.updateUserPasswordByEmail.user;
        const success = data.data.updateUserPasswordByEmail.success;

        if (!success) {
            console.error('❌ Ошибка от WordPress:', data.data.updateUserPasswordByEmail.message);
            return NextResponse.json(
                {
                    success: false,
                    message: translateForgotPasswordError(data.data.updateUserPasswordByEmail.message),
                    code: 'reset_error',
                },
                { status: 400 }
            );
        }

        console.log('✅ Пароль успешно изменен для пользователя:', userData.username);

        // ✅ ИЗМЕНЕНИЕ: Возвращаем пароль фронтенду для отправки (фронтенд сам отправит письмо или покажет пароль)
        return NextResponse.json(
            {
                success: true,
                message: 'Новый пароль создан. Вам будет отправлено письмо на почту.',
                password: newPassword,
                user: {
                    username: userData.username,
                    email: userData.email,
                    firstName: userData.firstName || '',
                },
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