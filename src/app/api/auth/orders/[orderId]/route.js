import { gql } from '@apollo/client';

export async function GET(request, { params }) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // ✅ AWAITED PARAMS
    const { orderId } = await params;

    console.log(`📍 GET /api/auth/orders/${orderId}`);
    console.log(`🔑 Token: ${token ? 'present' : 'missing'}`);

    if (!token) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const graphqlUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

        // ✅ Упрощённый GraphQL запрос (только поддерживаемые поля)
        const query = `
            query GetOrder($id: ID!) {
                order(id: $id, idType: DATABASE_ID) {
                    id
                    databaseId
                    orderNumber
                    status
                    date
                    total
                    subtotal
                    shippingTotal
                    discountTotal
                    paymentMethod
                    paymentMethodTitle
                    billing {
                        firstName
                        lastName
                        company
                        address1
                        address2
                        city
                        state
                        postcode
                        country
                        email
                        phone
                    }
                    shipping {
                        firstName
                        lastName
                        company
                        address1
                        address2
                        city
                        state
                        postcode
                        country
                    }
                    lineItems {
                        nodes {
                            productId
                            variationId
                            quantity
                            subtotal
                            total
                            product {
                                node {
                                    id
                                    databaseId
                                    name
                                    slug
                                    image {
                                        sourceUrl
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query,
                variables: { id: orderId },
            }),
        });

        const data = await response.json();

        if (data.errors) {
            console.error('❌ GraphQL errors:', data.errors);
            return Response.json({ error: data.errors[0]?.message }, { status: 400 });
        }

        const order = data.data?.order;

        if (!order) {
            console.error('🔴 Order not found');
            return Response.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log(`✅ Order #${order.orderNumber} found`);

        return Response.json({ order });

    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
