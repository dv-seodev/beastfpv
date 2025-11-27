import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand store для управления корзиной
 * Использует persist middleware для сохранения в localStorage
 */
export const useCartStore = create(
    persist(
        (set, get) => ({
            // ============ СОСТОЯНИЕ (STATE) ============

            items: [],
            selectedShipping: '1',
            selectedPayment: '1',

            // ============ ДЕЙСТВИЯ (ACTIONS) ============

            /**
             * Добавление товара в корзину
             */
            addItem: (product) => {
                console.log('Добавляем товар:', product);
                set((state) => {
                    const existingItem = state.items.find(item => item.id === product.id);

                    if (existingItem) {
                        return {
                            items: state.items.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                            )
                        };
                    }

                    return {
                        items: [...state.items, { ...product, quantity: 1 }]
                    };
                });
            },

            /**
             * Удаление товара из корзины
             */
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== id)
                }));
            },

            /**
             * Обновление количества товара
             */
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

            /**
             * Установка способа доставки
             */
            setSelectedShipping: (shippingId) => {
                set({ selectedShipping: shippingId });
            },

            /**
             * Установка способа оплаты
             */
            setSelectedPayment: (paymentId) => {
                set({ selectedPayment: paymentId });
            },

            /**
             * Очистка всей корзины
             */
            clearCart: () => {
                set({
                    items: [],
                    selectedShipping: '1',
                    selectedPayment: '1',
                });
            },

            // ============ ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ (SELECTORS) ============

            /**
             * Получение общего количества товаров
             */
            totalItems: () => {
                const items = get().items;
                return items.reduce((total, item) => total + item.quantity, 0);
            },

            /**
             * Получение общей стоимости товаров
             */
            totalPrice: () => {
                const items = get().items;
                return items.reduce((total, item) => {
                    const price = typeof item.price === 'string'
                        ? parseFloat(item.price.replace(/[^\d,.-]/g, '').replace(',', '.'))
                        : Number(item.price) || 0;

                    const quantity = Number(item.quantity) || 0;

                    return total + (price * quantity);
                }, 0);
            },

            /**
             * Получение количества конкретного товара
             */
            getItemQuantity: (id) => {
                const item = get().items.find(item => item.id === id);
                return item ? item.quantity : 0;
            },

            /**
             * Проверка, есть ли товар в корзине
             */
            isInCart: (id) => {
                return get().items.some(item => item.id === id);
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);
