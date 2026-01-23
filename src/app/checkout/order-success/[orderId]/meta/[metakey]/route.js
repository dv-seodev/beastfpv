// app/api/orders/[orderId]/meta/[metaKey]/route.js

export async function GET(request, { params }) {
    try {
        const { orderId, metaKey } = params;

        // URL твоего WordPress API
        const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8888';

        // Запрашиваем заказ с мета-данными
        const response = await fetch(
            `${wpUrl}/wp-json/wc/v3/orders/${orderId}`,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.WORDPRESS_API_KEY}:${process.env.WORDPRESS_API_SECRET}`
                    ).toString('base64')}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            return Response.json(
                { error: 'Order not found' },
                { status: response.status }
            );
        }

        const order = await response.json();

        // Ищем нужное мета-поле
        if (order.meta_data) {
            const meta = order.meta_data.find(m => m.key === metaKey);

            if (meta) {
                return Response.json({
                    key: meta.key,
                    value: meta.value
                });
            }
        }

        // Если мета не найдено
        return Response.json(
            { error: 'Meta key not found' },
            { status: 404 }
        );

    } catch (error) {
        console.error('Error fetching order meta:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
