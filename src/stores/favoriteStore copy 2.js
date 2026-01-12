'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoriteStore = (
    persist(
        (set, get) => ({
            favoriteIds: [],

            addItem: (product) => {
                const productId = product.databaseId;

                const currentIds = localStorage.getItem("favoriteIds");
                const curIds = currentIds ? JSON.parse(currentIds) : [];

                if (curIds.includes(productId)) {
                    console.log('⚠️ Товар уже в избранном');
                    return;
                }

                const newFavoriteIds = [...curIds, productId];

                const asjzx = JSON.stringify(newFavoriteIds);
                localStorage.setItem("favoriteIds", asjzx);
            },

            /**
             * Удаление товара из избранного
             */
            removeItem: (id) => {
                console.log('❌ Удаляем из избранного (ID):', id);
                console.log('📊 Текущие ID в стором ПЕРЕД удалением:', get().favoriteIds);

                // ✅ ИСПРАВЛЕНО: получаем свежее состояние из стора ПЕРЕД удалением
                const currentIds = localStorage.getItem("favoriteIds");
                // const curIds = JSON.parse(currentIds);

                const newFavoriteIds = curIds.filter(itemId => itemId !== id);

                console.log('✅ Товар удалён из избранного. Было:', currentIds.length, 'Стало:', newFavoriteIds.length, 'ID:', newFavoriteIds);

                // Устанавливаем новое состояние напрямую
                const asjzx = JSON.stringify(newFavoriteIds);
                localStorage.setItem("favoriteIds", asjzx);
            },

            /**
             * Переключение добавления/удаления товара из избранного
             */
            toggleFavorite: (product) => {
                const productId = product.databaseId;
                console.log('🔄 Переключаем избранное для:', productId);

                const currentIds = localStorage.getItem("favoriteIds");
                const curIds = JSON.parse(currentIds);

                const isFavorite = get().isInFavorites(productId);
                console.log('📊 Текущее состояние:', isFavorite ? 'в избранном' : 'не в избранном');

                if (isFavorite) {
                    console.log('➖ Удаляем из избранного');
                    get().removeItem(productId);
                } else {
                    console.log('➕ Добавляем в избранное');
                    get().addItem(product);
                }
            },

            isInFavorites: (id) => {
                try {
                    const currentIds = localStorage.getItem("favoriteIds");
                    console.log('список id товаров в избранном', currentIds);

                    // ✅ Проверяем наличие данных ДО парсинга
                    if (!currentIds) {
                        return false;
                    }

                    const curIds = JSON.parse(currentIds);
                    console.log('нормализованный список', curIds);

                    // ✅ Проверяем, что это массив
                    if (!Array.isArray(curIds)) {
                        return false;
                    }

                    if (curIds.includes(id)) { console.log("товар в списке избранного"); }
                    else { console.log("товара нет в списке избранного"); }
                    return curIds.includes(id);
                } catch (e) {
                    return false;
                }
            },

            getFavoriteIds: () => {
                try {
                    // ✅ Проверяем наличие window (это клиент, не сервер)
                    if (typeof window === 'undefined') {
                        return [];  // На сервере возвращаем пустой массив
                    }

                    const currentIds = localStorage.getItem("favoriteIds");
                    const curIds = currentIds ? JSON.parse(currentIds) : [];

                    if (!Array.isArray(curIds)) {
                        return [];
                    }

                    return curIds;
                } catch (e) {
                    console.error('❌ Ошибка:', e);
                    return [];
                }
            },

            /**
             * Установить список ID избранных товаров
             * (для восстановления из API или синхронизации)
             */
            setFavoriteIds: (ids) => {
                console.log('📥 Устанавливаем список ID:', ids);
                set({ favoriteIds: ids || [] });
            }
        }),
        {
            name: 'favorite-storage', // Ключ для localStorage
            version: 1, // Версия схемы для миграции в будущем
            // ✅ ДОБАВЛЕНО: функция миграции для совместимости с предыдущими версиями
            migrate: (persistedState, version) => {
                console.log('📦 Миграция хранилища. Версия:', version);

                if (version === 0) {
                    // Если это старая версия с другой структурой данных
                    // конвертируем в новый формат
                    return {
                        favoriteIds: persistedState?.items || persistedState?.favoriteIds || []
                    };
                }

                // Для текущей версии - просто возвращаем как есть
                return persistedState;
            }
        }
    )
);