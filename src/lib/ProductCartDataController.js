import api from './api';
import { useQuery } from "@apollo/client/react";

export const useProductData = (slug) => {
    const productQuery = useQuery(api.fetchProductBySlug(slug), {
        skip: !slug
    });

    const isLoading = productQuery.loading;
    const error = productQuery.error;

    const parsePriceToNumber = (priceString) => {
        if (!priceString) return 0;
        if (typeof priceString === 'number') return priceString;

        const cleanPrice = priceString
            .replace(/&nbsp;/g, '')
            .replace(/\s/g, '')
            .replace(/[^\d,]/g, '')
            .replace(',', '.');

        return parseFloat(cleanPrice) || 0;
    };

    // ✅ ДОБАВЛЕНО: функция для парсинга HTML характеристик
    const parseCharacteristics = (htmlString) => {
        if (!htmlString) return [];

        // Удаляем все переводы строк и лишние пробелы
        const cleanHtml = htmlString.replace(/\r\n/g, '\n').trim();

        // Разбиваем по <span class="atr">
        const parts = cleanHtml.split(/<span class="atr">|<\/span>/);

        const characteristics = [];

        // Проходим по частям: [название, значение, название, значение, ...]
        for (let i = 0; i < parts.length - 1; i += 2) {
            const name = parts[i].trim();
            const value = parts[i + 1].trim();

            if (name && value) {
                characteristics.push({
                    naimenovanie: name,
                    znachenie: value
                });
            }
        }

        return characteristics;
    };

    const formatProductData = (rawData) => {
        if (!rawData?.product) return null;

        const product = rawData.product;

        // ✅ ДОБАВЛЕНО: извлекаем ACF данные из metaData
        const metaData = {};
        if (product.metaData && Array.isArray(product.metaData)) {
            product.metaData.forEach(meta => {
                metaData[meta.key] = meta.value;
            });
        }

        // ✅ ДОБАВЛЕНО: парсим характеристики из описания товара
        const opisanieTovara = metaData['opisanie_tovara'] || '';
        const characteristics = parseCharacteristics(opisanieTovara);

        console.log('Parsed characteristics:', characteristics); // для отладки

        const priceNum = parsePriceToNumber(product.price);
        const regularPriceNum = parsePriceToNumber(product.regularPrice);
        const salePriceNum = parsePriceToNumber(product.salePrice);

        const hasDiscount = salePriceNum > 0 && regularPriceNum > 0 &&
            salePriceNum < regularPriceNum;

        let discountPercent = 0;
        if (hasDiscount) {
            discountPercent = Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100);
        }

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            shortDescription: product.shortDescription,
            sku: product.sku,
            price: product.price,
            regularPrice: product.regularPrice,
            salePrice: product.salePrice,
            priceNum: priceNum,
            regularPriceNum: regularPriceNum,
            salePriceNum: salePriceNum,
            stockStatus: product.stockStatus,
            stockQuantity: product.stockQuantity,
            averageRating: product.averageRating,
            reviewCount: product.reviewCount,
            image: product.image,
            galleryImages: product.galleryImages?.nodes || [],
            attributes: product.attributes?.nodes || [],
            categories: product.productCategories?.nodes || [],
            variations: product.variations?.nodes || [],
            // ✅ ДОБАВЛЕНО: характеристики из ACF
            characteristics: characteristics,
            metaData: metaData,
            hasDiscount: hasDiscount,
            discountPercent: discountPercent,
        };
    };

    const data = !isLoading && !error ? formatProductData(productQuery.data) : null;

    return {
        data,
        loading: isLoading,
        error
    };
};
