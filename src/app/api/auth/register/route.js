import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

// ✅ ИЗМЕНЕНИЕ: Функция для расшифровки ошибок регистрации на русский
const translateRegisterError = (errorMessage) => {
    const errorMap = {
        // Username ошибки
        'username already exists': 'Это имя пользователя уже занято. Выберите другое.',
        'username is invalid': 'Имя пользователя содержит недопустимые символы.',
        'username required': 'Имя пользователя обязательно.',
        'username too short': 'Имя пользователя слишком короткое.',

        // Email ошибки
        'email already exists': 'Этот email уже зарегистрирован. Используйте другой или войдите.',
        'email is invalid': 'Введите корректный email адрес.',
        'email required': 'Email адрес обязателен.',
        'invalid email': 'Неверный формат email адреса.',

        // Password ошибки
        'password too short': 'Пароль слишком короткий. Минимум 6 символов.',
        'password required': 'Пароль обязателен.',
        'password is weak': 'Пароль слишком простой. Используйте буквы, цифры и символы.',

        // Общие ошибки
        'invalid request': 'Неверный запрос. Проверьте данные.',
        'server error': 'Ошибка сервера. Попробуйте позже.',
        'user registration failed': 'Ошибка при регистрации. Попробуйте еще раз.',
    };

    // Ищем совпадение в errorMap (case-insensitive)
    const lowerError = errorMessage?.toLowerCase() || '';
    for (const [key, value] of Object.entries(errorMap)) {
        if (lowerError.includes(key.toLowerCase())) {
            return value;
        }
    }

    // Если совпадения не найдены, возвращаем исходное сообщение
    return errorMessage || 'Ошибка при регистрации. Попробуйте позже.';
};

// ✅ ИЗМЕНЕНИЕ: Функция валидации входных данных на сервере
const validateRegistrationInput = (username, email, password) => {
    const errors = [];

    // Проверка username
    if (!username || typeof username !== 'string') {
        errors.push('Имя пользователя обязательно');
    } else if (username.trim().length < 3) {
        errors.push('Имя пользователя должно содержать минимум 3 символа');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание');
    }

    // Проверка email
    if (!email || typeof email !== 'string') {
        errors.push('Email адрес обязателен');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.push('Введите корректный email адрес');
    }

    // Проверка пароля
    if (!password || typeof password !== 'string') {
        errors.push('Пароль обязателен');
    } else if (password.length < 6) {
        errors.push('Пароль должен содержать минимум 6 символов');
    }

    return errors;
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        console.log('📝 Попытка регистрации:', username, email);

        // ✅ ИЗМЕНЕНИЕ: Валидация входных данных на сервере
        const validationErrors = validateRegistrationInput(username, email, password);
        if (validationErrors.length > 0) {
            console.log('❌ Ошибки валидации:', validationErrors);
            return NextResponse.json(
                {
                    success: false,
                    message: validationErrors[0],
                    errors: validationErrors,
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

        // GraphQL мутация для регистрации
        const graphqlQuery = `
            mutation RegisterCustomer($input: RegisterCustomerInput!) {
                registerCustomer(input: $input) {
                    customer {
                        databaseId
                        id
                        username
                        email
                        firstName
                        lastName
                    }
                    authToken
                }
            }
        `;

        const variables = {
            input: {
                username: username.trim(),
                email: email.trim(),
                password: password,
            }
        };

        console.log('🔄 Отправляем GraphQL запрос для регистрации...');

        const response = await fetch(`${WORDPRESS_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: variables,
            }),
        });

        const data = await response.json();

        console.log('📥 Ответ от WordPress:', data);

        // ✅ ИЗМЕНЕНИЕ: Обработка GraphQL ошибок с расшифровкой
        if (data.errors && data.errors.length > 0) {
            console.error('❌ GraphQL ошибки:', data.errors);

            const errorMessage = data.errors[0]?.message || 'Ошибка при регистрации';
            const translatedError = translateRegisterError(errorMessage);

            // ✅ ИЗМЕНЕНИЕ: Определяем код ошибки для клиента
            let errorCode = 'registration_error';
            if (errorMessage.toLowerCase().includes('username')) {
                errorCode = 'username_exists';
            } else if (errorMessage.toLowerCase().includes('email')) {
                errorCode = 'email_exists';
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

        if (!data.data || !data.data.registerCustomer) {
            console.error('❌ Неожиданный ответ от WordPress:', data);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Ошибка при регистрации. Неожиданный ответ от сервера.',
                    code: 'unexpected_response',
                },
                { status: 500 }
            );
        }

        const customerData = data.data.registerCustomer.customer;

        console.log('✅ Пользователь успешно создан:', customerData.username);

        return NextResponse.json(
            {
                success: true,
                message: 'Регистрация прошла успешно! Вы можете войти в систему.',
                user: {
                    id: customerData.databaseId,
                    username: customerData.username,
                    email: customerData.email,
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Ошибка сервера при регистрации:', error.message);
        console.error('Stack:', error.stack);

        // ✅ ИЗМЕНЕНИЕ: Обработка JSON ошибок
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
                details: error.message,
            },
            { status: 500 }
        );
    }
}