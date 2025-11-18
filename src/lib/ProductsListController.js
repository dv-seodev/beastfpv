import { useCartStore } from '../stores/cartStore';

// Хук для работы с товарами
export const useProductsList = () => {
    const addItem = useCartStore((state) => state.addItem);

    // Функция для добавления товара в корзину
    const addCartProduct = (product) => {
        addItem({
            id: product.id,
            name: product.name,
            price: convertPriceToNumber(product.price), // Используем правильную конвертацию
            image: product.image?.sourceUrl
        });
    };

    // Функция для преобразования цены в число
    const convertPriceToNumber = (price) => {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            // Убираем копейки и все нецифровые символы за один проход
            const cleanPrice = price
                .replace(',00', '')  // Убираем копейки
                .replace(/\D/g, ''); // Убираем все нецифровые символы

            return parseInt(cleanPrice, 10) || 0;
        }
        return 0;
    };
    // Функция для форматирования цены
    const formatPrice = (price) => {
        if (typeof price !== 'string') return price;

        return price
            .replace(/&nbsp;/g, ' ') // Заменяем &nbsp; на обычный пробел
            .replace(/\s+/g, ' ')    // Убираем лишние пробелы
            .replace(',00', '')      // Убираем копейки если они нулевые
            .trim();                 // Обрезаем пробелы по краям
    };

    return {
        addCartProduct,
        formatPrice
    };
};