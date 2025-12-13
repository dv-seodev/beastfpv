import { GraphQLClient } from 'graphql-request';

export async function POST(request) {
    const { billingEmail } = await request.json();

    console.log('📍 GET /api/orders/by-email');
    console.log('📧 Email:', billingEmail);

    try {
        if (!billingEmail) {
            return Response.json({ error: 'Email required' }, { status: 400 });
        }

        const endpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

        // ✨ Basic Auth с Application Password
        const wpUser = process.env.WP_REST_USER;
        const wpPassword = process.env.WP_REST_PASSWORD;

        if (!wpUser || !wpPassword) {
            throw new Error('WP credentials not configured');
        }

        const basicAuth = Buffer.from(`${wpUser}:${wpPassword}`).toString('base64');

        const graphQLClient = new GraphQLClient(endpoint, {
            headers: {
                'Authorization': `Basic ${basicAuth}`, // ✨ Правильно!
                'Content-Type': 'application/json',
            },
        });

        // ✨ Правильный query с фрагментом
        const query = `
            query GetOrdersByEmail($email: String!) {
                orders(first: 100, where: { search: $email }) {
                    nodes {
                        id
                        databaseId
                        orderNumber
                        date
                        status
                        total
                        subtotal
                        customer {
                            id
                            databaseId
                            firstName
                            lastName
                            email
                        }
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

        const variables = {
            email: billingEmail,
        };

        console.log('🔍 Querying GraphQL...');
        const data = await graphQLClient.request(query, variables);

        console.log('✅ Orders found:', data.orders.nodes.length);

        return Response.json(data);

    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
