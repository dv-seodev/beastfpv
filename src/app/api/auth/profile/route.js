// src/app/api/auth/profile/route.js

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        console.log('📍 GET /api/auth/profile');

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

        if (data.errors) {
            console.error('❌ GraphQL error:', data.errors);
        }

        const viewer = data.data?.viewer;
        const customer = data.data?.customer;

        if (!viewer) {
            return Response.json({ error: 'Cannot get profile' }, { status: 401 });
        }

        console.log('✅ Profile loaded - Phone:', customer?.billing?.phone);

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

// ✅ Функция для преобразования названия страны в код
function getCountryCode(countryName) {
    const countryMap = {
        'Россия': 'RU',
        'Russia': 'RU',
        'США': 'US',
        'United States': 'US',
        'Англия': 'GB',
        'Great Britain': 'GB',
        'United Kingdom': 'GB',
        'Франция': 'FR',
        'France': 'FR',
        'Германия': 'DE',
        'Germany': 'DE',
        'Испания': 'ES',
        'Spain': 'ES',
        'Италия': 'IT',
        'Italy': 'IT',
    };

    // Если это уже двухбуквенный код, возвращаем как есть
    if (countryName && countryName.length === 2 && countryName === countryName.toUpperCase()) {
        return countryName;
    }

    // Иначе ищем в maps
    return countryMap[countryName] || countryName || '';
}

export async function PUT(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        const updatedData = await request.json();

        console.log('\n\n=== 🔴 PUT REQUEST STARTED ===');
        console.log('📍 PUT /api/auth/profile');
        console.log('📦 Phone from frontend:', updatedData.billing?.phone);
        console.log('📦 Country from frontend:', updatedData.billing?.country);

        if (!token) {
            return Response.json({ error: 'No token' }, { status: 401 });
        }

        const graphqlUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`;

        // 1️⃣ Get user ID
        console.log('\n--- Step 1: Getting user ID ---');
        const viewerQuery = `query { viewer { id databaseId } }`;

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

        const graphqlUserId = viewerData.data.viewer.id;
        const databaseUserId = viewerData.data.viewer.databaseId;

        console.log('✅ User ID:', databaseUserId);

        // 2️⃣ Update user (name, email) via GraphQL
        console.log('\n--- Step 2: Updating user (name, email) ---');

        const updateUserMutation = `
            mutation UpdateUser($id: ID!, $firstName: String, $lastName: String, $email: String) {
                updateUser(input: { id: $id, firstName: $firstName, lastName: $lastName, email: $email }) {
                    user { id firstName lastName email }
                }
            }
        `;

        const updateUserResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: updateUserMutation,
                variables: {
                    id: graphqlUserId,
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    email: updatedData.email,
                },
            }),
        });

        const updateUserData = await updateUserResponse.json();

        if (updateUserData.errors) {
            console.error('❌ User update error:', updateUserData.errors);
            return Response.json({ error: 'Failed to update user' }, { status: 400 });
        }

        console.log('✅ User updated');

        // 3️⃣ Update customer (billing/shipping) via GraphQL - ИСПРАВЛЕНО!
        console.log('\n--- Step 3: Updating customer (billing/shipping) via GraphQL ---');

        // ✅ ИСПРАВЛЕНО: Преобразуем country в enum
        const billingCountryCode = getCountryCode(updatedData.billing?.country);
        const shippingCountryCode = getCountryCode(updatedData.shipping?.country);

        console.log('📤 Country codes - Billing:', billingCountryCode, 'Shipping:', shippingCountryCode);

        const updateCustomerMutation = `
            mutation UpdateCustomer(
                $billingPhone: String
                $billingAddress1: String
                $billingAddress2: String
                $billingCity: String
                $billingState: String
                $billingPostcode: String
                $billingCountry: CountriesEnum
                $shippingAddress1: String
                $shippingAddress2: String
                $shippingCity: String
                $shippingState: String
                $shippingPostcode: String
                $shippingCountry: CountriesEnum
            ) {
                updateCustomer(
                    input: {
                        billing: {
                            phone: $billingPhone
                            address1: $billingAddress1
                            address2: $billingAddress2
                            city: $billingCity
                            state: $billingState
                            postcode: $billingPostcode
                            country: $billingCountry
                        }
                        shipping: {
                            address1: $shippingAddress1
                            address2: $shippingAddress2
                            city: $shippingCity
                            state: $shippingState
                            postcode: $shippingPostcode
                            country: $shippingCountry
                        }
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

        const customerVariables = {
            billingPhone: updatedData.billing?.phone || '',
            billingAddress1: updatedData.billing?.address1 || '',
            billingAddress2: updatedData.billing?.address2 || '',
            billingCity: updatedData.billing?.city || '',
            billingState: updatedData.billing?.state || '',
            billingPostcode: updatedData.billing?.postcode || '',
            billingCountry: billingCountryCode || null, // ✅ Enum code instead of string
            shippingAddress1: updatedData.shipping?.address1 || '',
            shippingAddress2: updatedData.shipping?.address2 || '',
            shippingCity: updatedData.shipping?.city || '',
            shippingState: updatedData.shipping?.state || '',
            shippingPostcode: updatedData.shipping?.postcode || '',
            shippingCountry: shippingCountryCode || null, // ✅ Enum code instead of string
        };

        console.log('📤 Sending billing phone:', customerVariables.billingPhone);

        const updateCustomerResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: updateCustomerMutation,
                variables: customerVariables,
            }),
        });

        const updateCustomerData = await updateCustomerResponse.json();

        console.log('📥 GraphQL response errors:', updateCustomerData.errors);
        console.log('📥 Phone in GraphQL response:', updateCustomerData.data?.updateCustomer?.customer?.billing?.phone);

        if (updateCustomerData.errors) {
            console.error('❌ Customer update error:', updateCustomerData.errors);
            // Продолжаем, может быть не критично
        }

        // 4️⃣ Verify by fetching fresh data
        console.log('\n--- Step 4: Verifying saved data ---');

        const verifyQuery = `
            query {
                viewer { id }
                customer {
                    billing { phone }
                    shipping { city }
                }
            }
        `;

        const verifyResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query: verifyQuery }),
        });

        const verifyData = await verifyResponse.json();
        const savedPhone = verifyData.data?.customer?.billing?.phone;

        console.log('✅ Phone after save:', savedPhone);
        console.log('=== 🟢 PUT REQUEST COMPLETED ===\n\n');

        const updatedUser = updateUserData.data?.updateUser?.user;
        const updatedCustomer = updateCustomerData.data?.updateCustomer?.customer;

        return Response.json({
            id: updatedUser?.id,
            databaseId: databaseUserId,
            firstName: updatedUser?.firstName || '',
            lastName: updatedUser?.lastName || '',
            email: updatedUser?.email || '',
            billing: {
                phone: savedPhone || updatedData.billing?.phone || '',
                address1: updatedCustomer?.billing?.address1 || updatedData.billing?.address1 || '',
                address2: updatedCustomer?.billing?.address2 || updatedData.billing?.address2 || '',
                city: updatedCustomer?.billing?.city || updatedData.billing?.city || '',
                state: updatedCustomer?.billing?.state || updatedData.billing?.state || '',
                postcode: updatedCustomer?.billing?.postcode || updatedData.billing?.postcode || '',
                country: updatedCustomer?.billing?.country || updatedData.billing?.country || '',
            },
            shipping: {
                address1: updatedCustomer?.shipping?.address1 || updatedData.shipping?.address1 || '',
                address2: updatedCustomer?.shipping?.address2 || updatedData.shipping?.address2 || '',
                city: updatedCustomer?.shipping?.city || updatedData.shipping?.city || '',
                state: updatedCustomer?.shipping?.state || updatedData.shipping?.state || '',
                postcode: updatedCustomer?.shipping?.postcode || updatedData.shipping?.postcode || '',
                country: updatedCustomer?.shipping?.country || updatedData.shipping?.country || '',
            },
        });

    } catch (error) {
        console.error('🔴 FATAL Error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
