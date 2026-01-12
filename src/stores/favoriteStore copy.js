import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand store для управления избранным
 */
export const useFavoriteStore = create(
    persist(
        (set, get) => ({
            // СОСТОЯНИЕ
            items: [],

            // ДЕЙСТВИЯ

            /**
             * Добавление товара в избранное
             */
            addItem: (product) => {
                console.log('Добавляем в избранное:', product);
                set((state) => {
                    const existingItem = state.items.find(item => item.id === product.id);

                    if (existingItem) {
                        console.log('Товар уже в избранном');
                        return state; // Товар уже есть, ничего не добавляем
                    }

                    return {
                        items: [...state.items, { ...product }]
                    };
                });
            },

            /**
             * Удаление товара из избранного
             */
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== id)
                }));
            },

            /**
             * Проверка, есть ли товар в избранном
             */
            isInFavorites: (id) => {
                return get().items.some(item => item.id === id);
            },

            /**
             * Получение количества товаров в избранном
             */
            getFavoriteCount: () => {
                return get().items.length;
            },

            /**
             * Очистка избранного
             */
            clearFavorites: () => {
                set({ items: [] });
            },

            /**
             * Получить все товары из избранного
             */
            getAllFavorites: () => {
                return get().items;
            }
        }),
        {
            name: 'favorite-storage', // Ключ для localStorage
        }
    )
);