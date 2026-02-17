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
        const normalizedWooUrl = wooUrl.replace(/\/+$/, '');
        const wooApiUrl = `${normalizedWooUrl}/wp-json/wc/v3/orders/${orderId}`;


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
                const productsUrl = `${normalizedWooUrl}/wp-json/wc/v3/products?include=${productIds.join(',')}&per_page=${productIds.length}`;


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


        // Получаем URL счёта для BACS (с fallback)
        const metaData = Array.isArray(data.meta_data) ? data.meta_data : [];
        const invoiceMetaKeys = [
            '_bacs_invoice_url',
            'bacs_invoice_url',
            '_invoice_url',
            'invoice_url',
        ];

        let invoice_url = '';
        for (const key of invoiceMetaKeys) {
            const found = metaData.find((m) => m?.key === key && m?.value);
            if (found?.value) {
                invoice_url = String(found.value).trim();
                break;
            }
        }

        if (!invoice_url && data?.invoice_url) {
            invoice_url = String(data.invoice_url).trim();
        }

        const paymentMethod = String(data?.payment_method || '').toLowerCase();
        const paymentMethodTitle = String(data?.payment_method_title || '').toLowerCase();
        const isBankTransfer =
            paymentMethod === 'bacs' ||
            paymentMethod === 'bank_transfer' ||
            paymentMethodTitle.includes('расчетн');

        if (!invoice_url && isBankTransfer) {
            const dateFromOrder = String(data?.date_created || '');
            const dateMatch = dateFromOrder.match(/^(\d{4})-(\d{2})-/);
            const now = new Date();
            const year = dateMatch?.[1] || String(now.getFullYear());
            const month = dateMatch?.[2] || String(now.getMonth() + 1).padStart(2, '0');
            const orderNumber = data?.number || orderId;
            const fallbackInvoiceUrl = `${normalizedWooUrl}/wp-content/uploads/${year}/${month}/invoice-${orderNumber}.pdf`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const headResponse = await fetch(fallbackInvoiceUrl, {
                    method: 'HEAD',
                    signal: controller.signal,
                });
                if (headResponse.ok) {
                    invoice_url = fallbackInvoiceUrl;
                    console.log('📄 Invoice URL fallback found:', invoice_url);
                } else {
                    console.warn('⚠️ Invoice fallback not found:', fallbackInvoiceUrl, 'status:', headResponse.status);
                }
            } catch (headError) {
                console.warn('⚠️ Invoice fallback HEAD failed:', headError.message);
            } finally {
                clearTimeout(timeoutId);
            }
        }

        if (invoice_url) {
            console.log('📄 Invoice URL found:', invoice_url);
            data.invoice_url = invoice_url;
        } else {
            console.warn('⚠️ Invoice URL not found for order:', data?.number || orderId);
        }

        return Response.json(data);


    } catch (error) {
        console.error('❌ Server Error:', error.message);
        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
