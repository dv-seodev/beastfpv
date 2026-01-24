export async function GET(request, { params }) {
    const { orderId } = await params;


    console.log(`📍 GET /api/orders/${orderId}`);


    if (!orderId) {
        return Response.json({ error: 'Order ID required' }, { status: 400 });
    }


    try {
        const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
        const wooUsername = process.env.WOOCOMMERCE_USERNAME;
        const wooPassword = process.env.WOOCOMMERCE_APP_PASSWORD;


        console.log('🔧 Config:', {
            wooUrl: wooUrl ? '✓' : '✗',
            wooUsername: wooUsername ? '✓' : '✗',
            wooPassword: wooPassword ? '✓' : '✗',
        });


        if (!wooUrl || !wooUsername || !wooPassword) {
            console.error('❌ Missing environment variables');
            return Response.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }


        const credentials = Buffer.from(`${wooUsername}:${wooPassword}`).toString('base64');
        const wooApiUrl = `${wooUrl}/wp-json/wc/v3/orders/${orderId}`;


        console.log('📡 Fetching order from:', wooApiUrl);


        const response = await fetch(wooApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`,
            },
        });


        console.log('📊 WooCommerce Status:', response.status);


        let data = await response.json();


        if (!response.ok) {
            console.error('❌ WooCommerce Error:', data);
            return Response.json(
                { error: data.message || 'Order not found' },
                { status: response.status }
            );
        }


        console.log(`✅ Order #${data.number} found with ${data.line_items?.length || 0} items`);


        // 🎯 ОБОГАЩАЕМ ЗАКАЗ SLUG'ОМ (точно как в auth версии)
        if (data.line_items && data.line_items.length > 0) {
            const productIds = data.line_items.map((item) => item.product_id);
            console.log('📦 Loading slugs for products:', productIds);


            try {
                const productsUrl = `${wooUrl}/wp-json/wc/v3/products?include=${productIds.join(',')}&per_page=${productIds.length}`;


                const productsResponse = await fetch(productsUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${credentials}`,
                    },
                });


                if (productsResponse.ok) {
                    const products = await productsResponse.json();


                    const slugMap = {};
                    products.forEach((product) => {
                        slugMap[product.id] = product.slug;
                        console.log(`✅ Slug for ${product.id}: ${product.slug}`);
                    });


                    data.line_items = data.line_items.map((item) => ({
                        ...item,
                        slug: slugMap[item.product_id] || null,
                    }));


                    console.log('✅ Order enriched with slugs');
                } else {
                    console.warn('⚠️ Failed to fetch products:', productsResponse.status);
                }
            } catch (slugError) {
                console.warn('⚠️ Error loading slugs:', slugError.message);
            }
        }


        // Получаем URL счёта для BACS
        const invoice_url = data.meta_data?.find(m => m.key === '_bacs_invoice_url')?.value;
        if (invoice_url) {
            console.log('📄 Invoice URL found:', invoice_url);
            data.invoice_url = invoice_url;
        }
        console.log('asdasd')
        return Response.json(data);


    } catch (error) {
        console.error('❌ Server Error:', error.message);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}