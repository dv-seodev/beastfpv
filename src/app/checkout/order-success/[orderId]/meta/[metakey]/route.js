// app/api/orders/[orderId]/route.js
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // важно, т.к. используем Buffer

const WP_URL = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WC_KEY = process.env.WORDPRESS_API_KEY;
const WC_SECRET = process.env.WORDPRESS_API_SECRET;

function wcAuthHeader() {
    const basic = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
    return `Basic ${basic}`;
}

async function fetchWooOrder(orderId) {
    const res = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${orderId}`, {
        method: 'GET',
        headers: {
            Authorization: wcAuthHeader(),
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, status: res.status, body: text };
    }

    const order = await res.json();
    return { ok: true, order };
}

async function fetchMeFromToken(token) {
    const res = await fetch(`${WP_URL}/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            query: `
        query Me {
          me {
            databaseId
            email
          }
        }
      `,
        }),
        cache: 'no-store',
    });

    const json = await res.json().catch(() => null);
    const me = json?.data?.me;

    if (!me || json?.errors?.length) return null;
    return me;
}

function sanitizeOrderForGuest(order) {
    // гостю по order_key обычно достаточно этого
    return {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
        date_created: order.date_created,
        payment_method: order.payment_method,
        payment_method_title: order.payment_method_title,
        order_key: order.order_key, // можно и не отдавать, но не критично
        invoice_url: order.invoice_url, // если реально нужно показывать гостю
        line_items: order.line_items,
        billing: order.billing,
        shipping: order.shipping,
    };
}

export async function GET(request, { params }) {
    const { orderId } = params;

    const { searchParams } = new URL(request.url);
    const orderKey =
        searchParams.get('order_key') || searchParams.get('key'); // поддержим оба

    const auth = request.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    // 1) Получаем заказ из WooCommerce
    const woo = await fetchWooOrder(orderId);
    if (!woo.ok) {
        // 404, 401 и т.п. прокидываем как есть
        return NextResponse.json(
            { error: 'Order not found' },
            { status: woo.status }
        );
    }

    const order = woo.order;

    // 2) Если есть order_key — разрешаем доступ гостю, но только при совпадении
    if (orderKey) {
        if (order.order_key !== orderKey) {
            return NextResponse.json(
                { error: 'Invalid order key' },
                { status: 403 }
            );
        }

        return NextResponse.json(sanitizeOrderForGuest(order), { status: 200 });
    }

    // 3) Иначе — доступ только залогиненному владельцу
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await fetchMeFromToken(token);
    if (!me) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meId = Number(me.databaseId);
    const customerId = Number(order.customer_id);

    if (!customerId || customerId !== meId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // владелец — отдаём заказ
    return NextResponse.json(order, { status: 200 });
}
