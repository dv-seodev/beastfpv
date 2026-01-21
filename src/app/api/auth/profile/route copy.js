export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        console.log('📍 GET /api/auth/profile');

        if (!token) {
            return Response.json({ error: 'No token' }, { status: 401 });
        }

        const graphqlUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

        // Получаем данные пользователя через GraphQL
        const query = `
            query ViewerProfile {
                viewer {
                    id
                    databaseId
                    firstName
                    lastName
                    email
                    username
                }
                customer {
                    billing {
                        phone
                        address1
                        address2
                        city
                        state
                        postcode
                        country
                    }
                    shipping {
                        address1
                        address2
                        city
                        state
                        postcode
                        country
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
            body: JSON.stringify({ query }),
        });

        const data = await response.json();

        console.log('📦 GraphQL Response:', JSON.stringify(data, null, 2));

        if (data.errors) {
            console.error('❌ GraphQL error:', data.errors);
        }

        const viewer = data.data?.viewer;
        const customer = data.data?.customer;

        if (!viewer) {
            return Response.json({ error: 'Cannot get profile' }, { status: 401 });
        }

        console.log('✅ Profile loaded');

        return Response.json({
            id: viewer.id,
            databaseId: viewer.databaseId,
            firstName: viewer.firstName || '',
            lastName: viewer.lastName || '',
            email: viewer.email || '',
            username: viewer.username || '',
            billing: {
                phone: customer?.billing?.phone || '',
                address1: customer?.billing?.address1 || '',
                address2: customer?.billing?.address2 || '',
                city: customer?.billing?.city || '',
                state: customer?.billing?.state || '',
                postcode: customer?.billing?.postcode || '',
                country: customer?.billing?.country || '',
            },
            shipping: {
                address1: customer?.shipping?.address1 || '',
                address2: customer?.shipping?.address2 || '',
                city: customer?.shipping?.city || '',
                state: customer?.shipping?.state || '',
                postcode: customer?.shipping?.postcode || '',
                country: customer?.shipping?.country || '',
            },
        });
    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        const updatedData = await request.json();

        console.log('📍 PUT /api/auth/profile');

        if (!token) {
            return Response.json({ error: 'No token' }, { status: 401 });
        }

        const graphqlUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

        // Получаем ID пользователя
        const viewerQuery = `
            query {
                viewer {
                    id
                    databaseId
                }
            }
        `;

        const viewerResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query: viewerQuery }),
        });

        const viewerData = await viewerResponse.json();

        if (viewerData.errors || !viewerData.data?.viewer?.id) {
            console.error('❌ Cannot get user ID');
            return Response.json({ error: 'Cannot get user ID' }, { status: 401 });
        }

        const userId = viewerData.data.viewer.id;
        console.log('👤 User ID:', userId);

        // Обновляем профиль через одну mutation
        const mutation = `
            mutation UpdateUserProfile(
                $id: ID!
                $firstName: String
                $lastName: String
                $email: String
                $billing: CustomerAddressInput
                $shipping: CustomerAddressInput
            ) {
                updateUser(
                    input: {
                        id: $id
                        firstName: $firstName
                        lastName: $lastName
                        email: $email
                    }
                ) {
                    user {
                        id
                        databaseId
                        firstName
                        lastName
                        email
                    }
                }
                updateCustomer(
                    input: {
                        billing: $billing
                        shipping: $shipping
                    }
                ) {
                    customer {
                        billing {
                            phone
                            address1
                            address2
                            city
                            state
                            postcode
                            country
                        }
                        shipping {
                            address1
                            address2
                            city
                            state
                            postcode
                            country
                        }
                    }
                }
            }
        `;

        const variables = {
            id: userId,
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
            billing: {
                phone: updatedData.billing?.phone,
                address1: updatedData.billing?.address1,
                address2: updatedData.billing?.address2,
                city: updatedData.billing?.city,
                state: updatedData.billing?.state,
                postcode: updatedData.billing?.postcode,
                country: updatedData.billing?.country,
            },
            shipping: {
                address1: updatedData.shipping?.address1,
                address2: updatedData.shipping?.address2,
                city: updatedData.shipping?.city,
                state: updatedData.shipping?.state,
                postcode: updatedData.shipping?.postcode,
                country: updatedData.shipping?.country,
            },
        };

        console.log('💾 Updating profile with variables:', variables);

        const updateResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: mutation,
                variables,
            }),
        });

        const updateData = await updateResponse.json();

        console.log('📦 Update response:', JSON.stringify(updateData, null, 2));

        if (updateData.errors) {
            console.error('❌ GraphQL error:', updateData.errors);
            return Response.json(
                { error: updateData.errors.message },
                { status: 400 }
            );
        }

        console.log('✅ Profile updated');

        const updatedUser = updateData.data?.updateUser?.user;
        const updatedCustomer = updateData.data?.updateCustomer?.customer;

        return Response.json({
            id: updatedUser?.id,
            databaseId: updatedUser?.databaseId,
            firstName: updatedUser?.firstName,
            lastName: updatedUser?.lastName,
            email: updatedUser?.email,
            billing: updatedCustomer?.billing || updatedData.billing,
            shipping: updatedCustomer?.shipping || updatedData.shipping,
        });
    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
