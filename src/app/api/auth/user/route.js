export async function GET(request) {
    console.log('📍 GET /api/auth/user');

    try {
        const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
        const wooUsername = process.env.WOOCOMMERCE_USERNAME;
        const wooPassword = process.env.WOOCOMMERCE_APP_PASSWORD;

        if (!wooUrl || !wooUsername || !wooPassword) {
            return Response.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // ✅ Получаем текущего пользователя
        const credentials = Buffer.from(`${wooUsername}:${wooPassword}`).toString('base64');
        const wooApiUrl = `${wooUrl}/wp-json/wc/v3/customers/me`;

        console.log('📡 Fetching from:', wooApiUrl);

        const response = await fetch(wooApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ WooCommerce Error:', data);
            return Response.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        console.log(`✅ User #${data.id} found`);
        return Response.json(data);

    } catch (error) {
        console.error('❌ Server Error:', error.message);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
