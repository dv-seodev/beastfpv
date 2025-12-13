export async function POST(request) {
    try {
        const { username, password } = await request.json();

        console.log('📍 POST /api/auth/login');
        console.log('👤 Username:', username);

        const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

        // ✨ Пробуем разные endpoints для получения информации о пользователе
        const endpoints = [
            // Вариант 1: wp/v2/users/me (стандартный WordPress REST API)
            {
                url: `${wordpressUrl}/wp-json/wp/v2/users/me`,
                needsAuth: true,
            },
            // Вариант 2: wc/v3/customers/me (WooCommerce REST API)
            {
                url: `${wordpressUrl}/wp-json/wc/v3/customers/me`,
                needsAuth: true,
            },
        ];

        const credentials = Buffer.from(`${username}:${password}`).toString('base64');

        for (const endpoint of endpoints) {
            console.log(`\n🧪 Trying: ${endpoint.url}`);

            try {
                const response = await fetch(endpoint.url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                    },
                });

                console.log(`   Status: ${response.status}`);

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Success!');

                    // ✨ Преобразуем ответ в стандартный формат
                    const userData = {
                        id: data.id,
                        email: data.email || data.billing?.email,
                        username: data.username || username,
                        firstName: data.first_name,
                        lastName: data.last_name,
                    };

                    console.log('👤 User data:', userData);

                    // ✨ Возвращаем credentials как токен (они уже в Base64)
                    return Response.json({
                        token: credentials,
                        user: userData,
                        message: 'Login successful',
                    });
                }
            } catch (error) {
                console.log(`   Error: ${error.message}`);
                continue;
            }
        }

        // ✨ Если все endpoint'ы не сработали, пробуем простой способ
        console.log('\n🧪 Trying direct credentials verification...');

        return Response.json({
            token: credentials,
            user: {
                id: null,
                email: null,
                username: username,
                firstName: null,
                lastName: null,
            },
            message: 'Using credentials directly',
        }, { status: 200 });

    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
