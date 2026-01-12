export async function POST(request) {
    try {
        const orderData = await request.json();

        console.log('📋 Получены данные заказа:', orderData);

        // ✅ Валидация
        if (!orderData.billing?.first_name || !orderData.billing?.phone) {
            console.error('❌ Ошибка валидации:', {
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

        // ✅ ПОЛУЧАЕМ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ
        const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
        const wooUsername = process.env.WOOCOMMERCE_USERNAME;
        const wooPassword = process.env.WOOCOMMERCE_APP_PASSWORD;

        console.log('🔧 Конфигурация:');
        console.log('  WooCommerce URL:', wooUrl);
        console.log('  Username:', wooUsername ? '✓' : '✗');
        console.log('  App Password:', wooPassword ? '✓' : '✗');

        if (!wooUrl || !wooUsername || !wooPassword) {
            console.error('❌ Ошибка конфигурации - отсутствуют переменные окружения');
            return Response.json(
                {
                    error: 'Ошибка конфигурации сервера. Проверьте переменные окружения.',
                    missing: {
                        url: !wooUrl,
                        username: !wooUsername,
                        password: !wooPassword,
                    }
                },
                { status: 500 }
            );
        }

        // ✅ СОЗДАЁМ Basic Auth
        const credentials = Buffer.from(`${wooUsername}:${wooPassword}`).toString('base64');

        // ✅ REST API URL
        const wooApiUrl = `${wooUrl}/wp-json/wc/v3/orders`;

        console.log('📡 Отправляем на REST API:', wooApiUrl);

        // ✅ ФУНКЦИЯ ПОЛУЧЕНИЯ ЦЕНЫ ТОВАРА
        async function getProductPrice(productId) {
            try {
                const productUrl = `${wooUrl}/wp-json/wc/v3/products/${productId}`;
                const productResponse = await fetch(productUrl, {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                    },
                });

                if (!productResponse.ok) {
                    console.warn(`⚠️ Товар ${productId} не найден`);
                    return null;
                }

                const product = await productResponse.json();
                console.log(`✓ Товар ${productId} - цена: ${product.price}`);
                return product.price;
            } catch (err) {
                console.error(`❌ Ошибка получения товара ${productId}:`, err.message);
                return null;
            }
        }

        // ✅ ПОДГОТОВКА ДАННЫХ ЗАКАЗА - ПОЛУЧАЕМ ЦЕНЫ
        const preparedLineItems = [];

        for (const item of orderData.line_items) {
            const productId = parseInt(item.product_id);
            const quantity = parseInt(item.quantity);

            console.log(`🔍 Обработка товара ID: ${productId}, Количество: ${quantity}`);

            // Получаем цену товара
            const price = await getProductPrice(productId);

            if (price === null) {
                console.error(`❌ Не удалось получить цену для товара ${productId}`);
                // Пытаемся добавить товар БЕЗ цены (WooCommerce попробует использовать каталог)
            }

            preparedLineItems.push({
                product_id: productId,
                quantity: quantity,
                ...(price && { price }) // Добавляем цену если она есть
            });
        }

        // ✅ СОБИРАЕМ ФИНАЛЬНЫЕ ДАННЫЕ ЗАКАЗА
        const finalOrderData = {
            payment_method: orderData.payment_method || 'bacs',
            payment_method_title: orderData.payment_method_title || 'Bank Transfer',
            set_paid: false, // Заказ НЕ оплачен
            status: 'pending', // Статус "ожидание оплаты"
            billing: orderData.billing,
            shipping: orderData.shipping,
            line_items: preparedLineItems,
            shipping_lines: orderData.shipping_lines || [],
            meta_data: [
                {
                    key: '_created_via',
                    value: 'custom_frontend'
                }
            ]
        };

        console.log('📝 Итоговые данные заказа:', JSON.stringify(finalOrderData, null, 2));

        // ✅ REST API запрос с Basic Auth
        const response = await fetch(wooApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`,
            },
            body: JSON.stringify(finalOrderData),
        });

        const result = await response.json();

        console.log('📊 WooCommerce REST API Response Status:', response.status);
        console.log('📊 WooCommerce REST API Response:', result);

        // ✅ Проверяем ошибку
        if (!response.ok) {
            console.error('❌ WooCommerce REST API Error:', result);

            if (result.code === 'rest_authentication_error') {
                return Response.json(
                    {
                        error: 'Ошибка аутентификации. Проверьте WOOCOMMERCE_USERNAME и WOOCOMMERCE_APP_PASSWORD',
                        code: result.code,
                        details: result.message,
                    },
                    { status: 401 }
                );
            }

            if (result.code === 'woocommerce_rest_cannot_create') {
                return Response.json(
                    {
                        error: 'Недостаточно прав для создания заказа',
                        code: result.code,
                        details: result.message,
                    },
                    { status: 403 }
                );
            }

            return Response.json(
                {
                    error: result.message || result.error || 'Ошибка создания заказа',
                    code: result.code,
                    details: result,
                },
                { status: response.status }
            );
        }

        // ✅ Успех!
        console.log('✅ Заказ успешно создан в WooCommerce. ID:', result.id);
        console.log('✅ Order Total:', result.total);
        console.log('✅ Line Items Count:', result.line_items?.length);

        return Response.json(
            {
                success: true,
                orderId: result.id,
                orderNumber: result.number,
                orderStatus: result.status,
                orderTotal: result.total,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ Ошибка на сервере:', error);
        return Response.json(
            {
                error: error.message || 'Ошибка сервера',
                details: error.toString(),
            },
            { status: 500 }
        );
    }
}
