export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('📍 GET /api/auth/orders');

    try {
        if (!token) {
            return Response.json({ orders: [] });
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return Response.json({ error: 'Invalid token' }, { status: 401 });
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const userId = payload?.data?.user?.id;

        console.log('👤 User ID from JWT:', userId);

        if (!userId) {
            return Response.json({ orders: [] });
        }

        const graphqlUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

        const ordersQuery = `
            query GetUserOrders($customerId: Int!) {
                orders(first: 100, where: { customerId: $customerId }) {
                    nodes {
                        id
                        databaseId
                        orderNumber
                        date
                        status
                        total
                        subtotal
                        lineItems(first: 100) {
                            nodes {
                                quantity
                                subtotal
                                total
                                product {
                                    node {
                                        id
                                        databaseId
                                        name
                                    }
                                }
                            }
                        }
                        billing {
                            firstName
                            lastName
                            email
                            phone
                        }
                    }
                }
            }
        `;

        console.log('🔍 Querying orders for customer:', userId);

        const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: ordersQuery,
                variables: { customerId: parseInt(userId) },
            }),
        });

        const data = await response.json();

        console.log('📦 Response status:', response.status);

        if (data.errors) {
            console.error('❌ GraphQL errors:', data.errors);

            // ✨ Если токен истёк, сообщаем фронту
            const isExpiredToken = data.errors.some(err =>
                err.debugMessage?.includes('Expired token')
            );

            if (isExpiredToken) {
                return Response.json(
                    { error: 'Token expired', needsRefresh: true },
                    { status: 401 }
                );
            }

            return Response.json({ orders: [] });
        }

        const orders = data.data?.orders?.nodes || [];

        console.log(`✅ Orders received: ${orders.length}`);

        return Response.json({ orders });

    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
