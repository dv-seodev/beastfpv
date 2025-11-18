// lib/priceUtils.js
export const convertPriceToNumber = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        // Пример: "100 000,00 ₽" → "100000.00" → 100000
        const cleanPrice = price
        // .replace(/[^\d,]/g, '')  // Убираем всё кроме цифр и запятых
        // .replace(',', '.');      // Заменяем запятую на точку

        const number = parseFloat(cleanPrice);
        return isNaN(number) ? 0 : number;
    }
    return 0;
};

// export const formatNumberToPrice = (number) => {
//     return new Intl.NumberFormat('ru-RU', {
//         style: 'currency',
//         currency: 'RUB',
//         minimumFractionDigits: 0,
//         maximumFractionDigits: 0
//     }).format(number);
// };