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

        // ✅ ДОБАВЛЕНО: удаляем все HTML теги
        let cleanText = htmlString
            .replace(/<span[^>]*>/g, '') // удаляем открывающие <span>
            .replace(/<\/span>/g, '')     // удаляем закрывающие </span>
            .replace(/<[^>]*>/g, '')      // удаляем все остальные теги
            .replace(/&nbsp;/g, ' ')      // заменяем &nbsp; на пробелы
            .replace(/\r\n/g, '\n')       // нормализуем переводы строк
            .trim();

        // Разбиваем по переводам строк
        const lines = cleanText.split('\n').filter(line => line.trim().length > 0);

        const characteristics = [];

        // Проходим по линиям парами (название, значение)
        for (let i = 0; i < lines.length - 1; i += 2) {
            const name = lines[i].trim();
            const value = lines[i + 1].trim();

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
