const translateError = (errorMessage, statusCode) => {
    const errorMap = {
        // 400 - Bad Request
        'Invalid email address': 'Неверный формат email адреса',
        'missing_email': 'Email не указан',
        'missing_password': 'Пароль не указан',

        // 401 - Unauthorized (неверные учетные данные)
        'Invalid credentials': 'Неверное имя пользователя или пароль',
        'rest_invalid_param': 'Ошибка в параметрах запроса',
        'Invalid username or email': 'Неверное имя пользователя или email',

        // 403 - Forbidden
        'User cannot access this resource': 'У вас нет прав доступа',
        'rest_forbidden': 'Доступ запрещен',

        // 404 - Not Found
        'rest_no_route': 'Конечная точка API не найдена',
        'User not found': 'Пользователь не найден',

        // 500 - Server Error
        'Error connecting to server': 'Ошибка подключения к серверу',
        'rest_internal_error': 'Внутренняя ошибка сервера',
    };

    // По коду статуса
    const statusErrorMap = {
        400: 'Неверные данные. Проверьте учетные данные.',
        401: 'Неверное имя пользователя или пароль. Попробуйте еще раз.',
        403: 'У вас нет прав доступа к этому ресурсу.',
        404: 'Пользователь не найден в системе.',
        500: 'Ошибка сервера. Попробуйте позже.',
    };

    // Ищем точное совпадение в errorMap
    for (const [key, value] of Object.entries(errorMap)) {
        if (errorMessage?.includes(key)) {
            return value;
        }
    }

    // Если совпадения не найдены, используем статус код
    if (statusErrorMap[statusCode]) {
        return statusErrorMap[statusCode];
    }

    // Возвращаем исходное сообщение, если ничего не подошло
    return errorMessage || 'Ошибка при входе. Попробуйте позже.';
};

// ✅ ИЗМЕНЕНИЕ: Функция валидации входных данных
const validateLoginInput = (username, password) => {
    const errors = [];

    // Проверка username/email
    if (!username || typeof username !== 'string') {
        errors.push('Имя пользователя или email обязательны');
    } else if (username.trim().length < 2) {
        errors.push('Имя пользователя должно содержать минимум 2 символа');
    }

    // Проверка пароля
    if (!password || typeof password !== 'string') {
        errors.push('Пароль обязателен');
    } else if (password.length < 1) {
        errors.push('Пароль не должен быть пустым');
    }

    return errors;
};

// ✅ ИЗМЕНЕНИЕ: Функция для получения данных пользователя с правильной обработкой
const fetchUserData = async (wordpressUrl, credentials) => {
    const endpoints = [
        {
            url: `${wordpressUrl}/wp-json/wc/v3/customers/me`,
            type: 'woocommerce',
        },
        {
            url: `${wordpressUrl}/wp-json/wp/v2/users/me`,
            type: 'wordpress',
        },
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🧪 Пробуем endpoint: ${endpoint.url}`);

            const response = await fetch(endpoint.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}`,
                },
            });

            console.log(`   Статус: ${response.status}`);

            // ✅ ИЗМЕНЕНИЕ: Правильная обработка разных статусов
            if (response.status === 401) {
                console.log('   ⚠️ Неверные учетные данные');
                return {
                    success: false,
                    statusCode: 401,
                    message: 'invalid_credentials',
                };
            }

            if (!response.ok) {
                console.log(`   ❌ Ошибка: ${response.status}`);
                continue;
            }

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Успех!');

                // ✅ ИЗМЕНЕНИЕ: Преобразование данных в зависимости от типа endpoint
                let userData;
                if (endpoint.type === 'woocommerce') {
                    userData = {
                        id: data.id,
                        email: data.email,
                        username: data.username || null,
                        firstName: data.first_name || null,
                        lastName: data.last_name || null,
                    };
                } else {
                    userData = {
                        id: data.id,
                        email: data.email || null,
                        username: data.username,
                        firstName: data.first_name || null,
                        lastName: data.last_name || null,
                    };
                }

                return {
                    success: true,
                    userData,
                };
            }
        } catch (error) {
            console.log(`   Ошибка при запросе: ${error.message}`);
            continue;
        }
    }

    // Если все endpoints не сработали
    return {
        success: false,
        statusCode: 503,
        message: 'service_unavailable',
    };
};

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        console.log('📍 POST /api/auth/login');
        console.log('👤 Username:', username);

        // ✅ ИЗМЕНЕНИЕ: Валидация входных данных
        const validationErrors = validateLoginInput(username, password);
        if (validationErrors.length > 0) {
            console.log('❌ Ошибка валидации:', validationErrors);
            return Response.json(
                {
                    success: false,
                    error: validationErrors[0],
                    errors: validationErrors,
                },
                { status: 400 }
            );
        }

        const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
        if (!wordpressUrl) {
            console.error('🔴 NEXT_PUBLIC_WORDPRESS_URL не установлен');
            return Response.json(
                {
                    success: false,
                    error: 'Ошибка конфигурации сервера',
                },
                { status: 500 }
            );
        }

        // ✅ ИЗМЕНЕНИЕ: Кодируем учетные данные в Base64
        const credentials = Buffer.from(`${username}:${password}`).toString('base64');

        // ✅ ИЗМЕНЕНИЕ: Получаем данные пользователя
        const userResult = await fetchUserData(wordpressUrl, credentials);

        if (!userResult.success) {
            console.log('❌ Не удалось получить данные пользователя');

            const errorMessage = translateError(
                userResult.message,
                userResult.statusCode
            );

            return Response.json(
                {
                    success: false,
                    error: errorMessage,
                    code: userResult.message,
                },
                { status: userResult.statusCode || 401 }
            );
        }

        console.log('✅ Вход успешен!');
        console.log('👤 Данные пользователя:', userResult.userData);

        // ✅ ИЗМЕНЕНИЕ: Возвращаем Base64 токен (как был раньше)
        return Response.json(
            {
                success: true,
                token: credentials,
                user: userResult.userData,
                message: 'Вход выполнен успешно',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('🔴 Ошибка:', error.message);
        console.error('Stack:', error.stack);

        // ✅ ИЗМЕНЕНИЕ: Обработка JSON ошибок
        if (error instanceof SyntaxError) {
            return Response.json(
                {
                    success: false,
                    error: 'Неверный формат данных',
                    code: 'invalid_json',
                },
                { status: 400 }
            );
        }

        return Response.json(
            {
                success: false,
                error: 'Внутренняя ошибка сервера. Попробуйте позже.',
                code: 'server_error',
            },
            { status: 500 }
        );
    }
}