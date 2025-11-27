import api from './api';
import { useQuery } from "@apollo/client/react";

export const useProductData = (slug) => {
    const productQuery = useQuery(api.fetchProductBySlug(slug), {
        skip: !slug
    });

    const isLoading = productQuery.loading;
    const error = productQuery.error;

    // Функция для преобразования цены в число
    const parsePriceToNumber = (priceString) => {
        if (!priceString) return 0;
        if (typeof priceString === 'number') return priceString;

        // Убираем HTML entities, пробелы, валюту и заменяем запятую на точку
        const cleanPrice = priceString
            .replace(/&nbsp;/g, '')      // Убираем &nbsp;
            .replace(/\s/g, '')          // Убираем все пробелы
            .replace(/[^\d,]/g, '')      // Убираем всё кроме цифр и запятых
            .replace(',', '.');          // Заменяем запятую на точку

        return parseFloat(cleanPrice) || 0;
    };

    const formatProductData = (rawData) => {
        if (!rawData?.product) return null;

        const product = rawData.product;

        // Преобразуем цены в числа
        const priceNum = parsePriceToNumber(product.price);
        const regularPriceNum = parsePriceToNumber(product.regularPrice);
        const salePriceNum = parsePriceToNumber(product.salePrice);

        // Правильно определяем есть ли скидка
        const hasDiscount = salePriceNum > 0 && regularPriceNum > 0 &&
            salePriceNum < regularPriceNum;

        // Вычисляем процент скидки
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
            price: product.price,           // Оригинальная строка
            regularPrice: product.regularPrice, // Оригинальная строка
            salePrice: product.salePrice,   // Оригинальная строка
            priceNum: priceNum,             // Число для вычислений
            regularPriceNum: regularPriceNum, // Число для вычислений
            salePriceNum: salePriceNum,     // Число для вычислений
            stockStatus: product.stockStatus,
            stockQuantity: product.stockQuantity,
            averageRating: product.averageRating,
            reviewCount: product.reviewCount,
            image: product.image,
            galleryImages: product.galleryImages?.nodes || [],
            attributes: product.attributes?.nodes || [],
            categories: product.productCategories?.nodes || [],
            variations: product.variations?.nodes || [],
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