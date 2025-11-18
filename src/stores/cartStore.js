// stores/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Создаем store с помощью Zustand
export const useCartStore = create(
    // Используем persist middleware для сохранения в localStorage
    persist(
        // Функция, которая определяет состояние и действия
        (set, get) => ({
            // СОСТОЯНИЕ (STATE)
            // Массив товаров в корзине - изначально пустой
            items: [],

            // ДЕЙСТВИЯ (ACTIONS)

            // Добавление товара в корзину
            addItem: (product) => {
                set((state) => {
                    // Ищем, есть ли уже такой товар в корзине
                    const existingItem = state.items.find(item => item.id === product.id);

                    if (existingItem) {
                        // Если товар уже есть - увеличиваем его количество
                        return {
                            items: state.items.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            )
                        };
                    }

                    // Если товара нет - добавляем новый с количеством 1
                    return {
                        items: [...state.items, { ...product, quantity: 1 }]
                    };
                });
            },

            // Удаление товара из корзины
            removeItem: (id) => {
                set((state) => ({
                    // Фильтруем массив, оставляя все товары кроме удаляемого
                    items: state.items.filter(item => item.id !== id)
                }));
            },

            // Обновление количества товара
            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                set((state) => ({
                    items: state.items.map(item =>
                        item.id === id ? { ...item, quantity } : item
                    )
                }));
            },

            // Очистка всей корзины
            clearCart: () => {
                set({ items: [] });
            },

            // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ (SELECTORS)

            // Общее количество товаров в корзине
            totalItems: () => {
                // Получаем текущие товары из store
                const items = get().items;
                // Суммируем quantity всех товаров
                return items.reduce((total, item) => total + item.quantity, 0);
            },

            // Общая стоимость всех товаров в корзине
            totalPrice: () => {
                // Получаем текущие товары из store
                const items = get().items;
                // Суммируем price * quantity всех товаров
                return items.reduce((total, item) => {
                    // Преобразуем цену в число (на случай если price строка)
                    const price = typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'))
                        : item.price;
                    return total + (price * item.quantity);
                }, 0);
            },

            // Дополнительные полезные методы
            getItemQuantity: (id) => {
                const item = get().items.find(item => item.id === id);
                return item ? item.quantity : 0;
            },

            isInCart: (id) => {
                return get().items.some(item => item.id === id);
            }
        }),
        {
            // Настройки для сохранения в localStorage
            name: 'cart-storage', // Ключ, под которым будут сохраняться данные
        }
    )
);