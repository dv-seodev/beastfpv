// app/api/auth/login/route.js

import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return Response.json(
                { error: 'Username and password required' },
                { status: 400 }
            );
        }

        const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://test.beastfpv.ru';

        console.log(`🔍 Ищем пользователя: ${username}`);

        // ✅ Используем Basic Auth напрямую
        const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

        // 🔐 БЕЗ ?context=edit (чтобы не требовать повышенные права)
        const meResponse = await fetch(
            `${WORDPRESS_URL}/wp-json/wp/v2/users/me`,
            {
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                },
            }
        );

        console.log(`📊 Статус ответа: ${meResponse.status}`);

        if (!meResponse.ok) {
            const errorText = await meResponse.text();
            console.error('❌ Ошибка ответа:', errorText);
            return Response.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        const user = await meResponse.json();

        console.log('📦 Данные пользователя:', {
            id: user.id,
            name: user.name,
            slug: user.slug,
            link: user.link
        });

        // ✅ Теперь получим WooCommerce данные для email (если это customer)
        let userEmail = null;
        const WC_KEY = process.env.WC_CONSUMER_KEY;
        const WC_SECRET = process.env.WC_CONSUMER_SECRET;

        if (WC_KEY && WC_SECRET) {
            try {
                const wcAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

                const wcResponse = await fetch(
                    `${WORDPRESS_URL}/wp-json/wc/v3/customers?search=${user.slug}`,
                    {
                        headers: {
                            'Authorization': `Basic ${wcAuth}`,
                        },
                    }
                );

                if (wcResponse.ok) {
                    const customers = await wcResponse.json();
                    if (customers.length > 0) {
                        userEmail = customers[0].email;
                        console.log('📧 Email из WC:', userEmail);
                    }
                }
            } catch (wcError) {
                console.log('⚠️ Не удалось получить email из WC:', wcError.message);
            }
        }

        // ✅ Создаем JWT токен
        const token = jwt.sign(
            {
                id: user.id,
                username: user.slug || username,
                email: userEmail,
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        console.log('✅ Успешная авторизация:', user.name);

        return Response.json({
            token,
            user: {
                id: user.id,
                username: user.slug || username,
                email: userEmail,
                name: user.name,
                link: user.link,
            },
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
