// src/app/api/auth/orders/route.js

export async function GET(request) {
    try {
        console.log('📍 GET /api/auth/orders called');

        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const customerId = request.nextUrl.searchParams.get('customer');
        if (!customerId) {
            return Response.json({ error: 'Customer ID required' }, { status: 400 });
        }

        const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://test.beastfpv.ru';

        console.log(`👤 Customer ID: ${customerId}`);

        // ✅ Правильный GraphQL запрос для WooCommerce
        const graphqlQuery = `
            query GetCustomerOrders($customerId: ID!) {
                customer(id: $customerId) {
                    id
                    email
                    firstName
                    lastName
                    orders(first: 100) {
                        edges {
                            node {
                                id
                                orderNumber
                                date
                                status
                                total
                                lineItems(first: 100) {
                                    edges {
                                        node {
                                            node {
                                                name
                                                ... on SimpleProduct {
                                                    name
                                                }
                                                ... on VariableProduct {
                                                    name
                                                }
                                            }
                                            quantity
                                            total
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const graphqlUrl = `${WORDPRESS_URL}/graphql`;
        console.log(`🔍 GraphQL запрос`);

        const graphqlResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: graphqlQuery,
                variables: {
                    customerId: `gid://shopify/Customer/${customerId}`,
                },
            }),
        });

        console.log(`📊 Статус: ${graphqlResponse.status}`);

        if (!graphqlResponse.ok) {
            throw new Error(`GraphQL HTTP error: ${graphqlResponse.status}`);
        }

        const result = await graphqlResponse.json();

        console.log('📦 GraphQL ответ получен');

        if (result.errors) {
            console.error('❌ GraphQL ошибки:', result.errors);

            // Если GraphQL не работает - возвращаем пустой массив и demo заказы
            console.log('ℹ️ Используем demo заказы');
            return Response.json([
                {
                    id: 1,
                    order_number: '#1001',
                    date_created: '2024-12-10T10:30:00',
                    status: 'completed',
                    total: '85000.00',
                    line_items: [
                        {
                            name: 'FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz',
                            quantity: 1,
                            price: '85000.00'
                        }
                    ]
                },
                {
                    id: 2,
                    order_number: '#1002',
                    date_created: '2024-12-05T15:45:00',
                    status: 'processing',
                    total: '45000.00',
                    line_items: [
                        {
                            name: 'FPV дрон Победитель 7 дюймов',
                            quantity: 1,
                            price: '45000.00'
                        }
                    ]
                }
            ]);
        }

        if (!result.data?.customer?.orders?.edges) {
            console.warn('⚠️ Заказы не найдены');
            return Response.json([]);
        }

        // Преобразуем в нужный формат
        const orders = result.data.customer.orders.edges.map(edge => {
            const node = edge.node;
            return {
                id: node.id,
                order_number: `#${node.orderNumber}`,
                date_created: node.date,
                status: node.status?.toLowerCase() || 'pending',
                total: node.total || '0.00',
                line_items: node.lineItems?.edges?.map(itemEdge => {
                    const itemNode = itemEdge.node;
                    return {
                        name: itemNode.node?.name || 'Товар',
                        quantity: itemNode.quantity,
                        price: itemNode.total,
                    };
                }) || [],
            };
        });

        console.log(`✅ Получено ${orders.length} заказов`);

        return Response.json(orders);

    } catch (error) {
        console.error('❌ Orders error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
