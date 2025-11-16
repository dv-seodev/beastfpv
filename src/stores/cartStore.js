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

            // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ (SELECTORS)

            // Общее количество товаров в корзине
            totalItems: () => {
                // Получаем текущие товары из store
                const items = get().items;
                // Суммируем quantity всех товаров
                return items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            // Настройки для сохранения в localStorage
            name: 'cart-storage', // Ключ, под которым будут сохраняться данные
        }
    )
);