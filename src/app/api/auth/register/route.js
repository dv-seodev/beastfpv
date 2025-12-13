import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        // Валидация
        if (!username || !email || !password) {
            return NextResponse.json(
                { message: 'Все поля обязательны для заполнения' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Пароль должен содержать минимум 6 символов' },
                { status: 400 }
            );
        }

        console.log('📝 Регистрация пользователя через GraphQL:', username, email);

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
                username: username,
                email: email,
                password: password,
            }
        };

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

        // Обработка ошибок GraphQL
        if (data.errors && data.errors.length > 0) {
            console.error('❌ GraphQL ошибки:', data.errors);

            const errorMessage = data.errors?.message || 'Ошибка регистрации';

            // Обработка специфичных ошибок
            if (errorMessage.includes('username') && errorMessage.includes('exists')) {
                return NextResponse.json(
                    { message: 'Это имя пользователя уже занято' },
                    { status: 400 }
                );
            }

            if (errorMessage.includes('email') && errorMessage.includes('exists')) {
                return NextResponse.json(
                    { message: 'Этот email уже зарегистрирован' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { message: errorMessage },
                { status: 400 }
            );
        }

        if (!data.data || !data.data.registerCustomer) {
            console.error('❌ Неожиданный ответ:', data);
            return NextResponse.json(
                { message: 'Ошибка при регистрации' },
                { status: 500 }
            );
        }

        console.log('✅ Пользователь успешно создан:', data.data.registerCustomer.customer);

        return NextResponse.json(
            {
                success: true,
                message: 'Регистрация прошла успешно',
                user: {
                    id: data.data.registerCustomer.customer.databaseId,
                    username: data.data.registerCustomer.customer.username,
                    email: data.data.registerCustomer.customer.email,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ Ошибка сервера при регистрации:', error);
        return NextResponse.json(
            {
                message: 'Произошла ошибка на сервере. Попробуйте позже.',
                error: error.message
            },
            { status: 500 }
        );
    }
}
