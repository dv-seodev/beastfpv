import { GraphQLClient } from 'graphql-request';

const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      clientMutationId
      order {
        id
        databaseId
        orderNumber
        status
        total
      }
    }
  }
`;

export async function POST(request) {
    try {
        const orderData = await request.json();

        console.log('Получены данные:', orderData);

        // Валидация - проверяем snake_case ключи
        if (!orderData.billing?.first_name || !orderData.billing?.phone) {
            console.error('Ошибка валидации:', {
                first_name: orderData.billing?.first_name,
                phone: orderData.billing?.phone,
            });
            return Response.json(
                { error: 'Заполните все обязательные поля' },
                { status: 400 }
            );
        }

        if (!orderData.line_items || orderData.line_items.length === 0) {
            return Response.json(
                { error: 'Корзина пуста' },
                { status: 400 }
            );
        }

        const wooUrl = process.env.NEXT_PUBLIC_SITE_URL;
        const consumerKey = process.env.WORDPRESS_REST_API_KEY;
        const consumerSecret = process.env.WORDPRESS_REST_API_SECRET;

        if (!wooUrl || !consumerKey || !consumerSecret) {
            return Response.json(
                { error: 'Ошибка конфигурации' },
                { status: 500 }
            );
        }

        const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        // // REST API WooCommerce
        // const response = await fetch('/api/checkout', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(orderData),
        // });

        // ✅ СТАЛО (вызывает WooCommerce):
        const wooApiUrl = `${wooUrl}/wp-json/wc/v3/orders`;

        const response = await fetch(wooApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('WooCommerce error:', result);
            return Response.json(
                { error: result.message || 'Ошибка создания заказа' },
                { status: response.status }
            );
        }

        console.log('Заказ создан:', result.id);

        return Response.json(
            {
                success: true,
                orderId: result.id,
                orderNumber: result.number,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Ошибка:', error);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}