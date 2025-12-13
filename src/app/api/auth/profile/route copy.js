export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        console.log('📍 GET /api/auth/profile');
        console.log('🔑 JWT token:', !!token);

        if (!token) {
            return Response.json({ error: 'No token' }, { status: 401 });
        }

        const graphqlUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

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
            }
        `;

        console.log('🔍 Querying viewer profile...');

        const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();

        console.log('📦 Response status:', response.status);

        if (data.errors) {
            console.error('❌ GraphQL error:', data.errors);
            return Response.json(
                { error: data.errors.message },
                { status: 401 }
            );
        }

        const viewer = data.data?.viewer;

        if (!viewer) {
            console.error('❌ No viewer data');
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('✅ Profile loaded');

        // Возвращаем базовые данные + пустые billing/shipping
        return Response.json({
            id: viewer.id,
            databaseId: viewer.databaseId,
            firstName: viewer.firstName || '',
            lastName: viewer.lastName || '',
            email: viewer.email || '',
            username: viewer.username || '',
            billing: {
                phone: '',
                address1: '',
                address2: '',
                city: '',
                state: '',
                postcode: '',
                country: '',
            },
            shipping: {
                address1: '',
                address2: '',
                city: '',
                state: '',
                postcode: '',
                country: '',
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

        // Обновляем только базовые поля User (без billing/shipping)
        const mutation = `
            mutation UpdateUserProfile(
                $id: ID!
                $firstName: String
                $lastName: String
                $email: String
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
            }
        `;

        const variables = {
            id: userId,
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
        };

        console.log('💾 Updating with variables:', variables);

        const response = await fetch(graphqlUrl, {
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

        const data = await response.json();

        if (data.errors) {
            console.error('❌ GraphQL error:', data.errors);
            return Response.json(
                { error: data.errors.message },
                { status: 400 }
            );
        }

        console.log('✅ Profile updated');

        const updatedUser = data.data.updateUser.user;

        return Response.json({
            id: updatedUser.id,
            databaseId: updatedUser.databaseId,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            billing: updatedData.billing || {},
            shipping: updatedData.shipping || {},
        });
    } catch (error) {
        console.error('🔴 Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
