// app/api/auth/me/route.js

import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.slice(7);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        );

        const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://api.beastfpv.ru';
        const WC_KEY = process.env.WC_CONSUMER_KEY;
        const WC_SECRET = process.env.WC_CONSUMER_SECRET;

        if (!WC_KEY || !WC_SECRET) {
            return Response.json(
                { error: 'WooCommerce credentials not configured' },
                { status: 500 }
            );
        }

        const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

        const userResponse = await fetch(
            `${WORDPRESS_URL}/wp-json/wc/v3/customers/${decoded.id}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                },
            }
        );

        if (!userResponse.ok) {
            return Response.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = await userResponse.json();

        return Response.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            },
        });

    } catch (error) {
        console.error('❌ Auth error:', error);
        return Response.json(
            { error: error.message || 'Authentication failed' },
            { status: 401 }
        );
    }
}
