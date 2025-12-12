import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            // ✅ Установить пользователя после входа
            setUser: (user, token) => {
                console.log('🔐 Устанавливаем пользователя:', user);
                set({
                    user,
                    token,
                    isAuthenticated: !!user,
                    error: null,
                });
            },

            // ✅ Очистить данные при выходе
            logout: () => {
                console.log('🚪 Выход пользователя');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // ✅ Установить ошибку
            setError: (error) => {
                console.log('⚠️ Ошибка:', error);
                set({ error });
            },

            // ✅ Установить загрузку
            setLoading: (loading) => set({ loading }),

            // ✅ Обновить данные пользователя
            updateUser: (userData) =>
                set((state) => ({
                    user: { ...state.user, ...userData },
                })),
        }),
        {
            name: 'auth-store',
        }
    )
);
