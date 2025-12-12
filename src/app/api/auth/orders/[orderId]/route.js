// app/api/orders/[orderId]/route.js

export async function GET(request, { params }) {
    try {
        // ✅ AWAITED PARAMS
        const { orderId } = await params;

        const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://test.beastfpv.ru';
        const WC_KEY = process.env.WC_CONSUMER_KEY;
        const WC_SECRET = process.env.WC_CONSUMER_SECRET;

        if (!WC_KEY || !WC_SECRET) {
            return Response.json(
                { error: 'WooCommerce credentials not configured' },
                { status: 500 }
            );
        }

        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

        const response = await fetch(
            `${WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch order: ${response.statusText}`);
        }

        const order = await response.json();
        return Response.json(order);

    } catch (error) {
        console.error('Error fetching order:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
