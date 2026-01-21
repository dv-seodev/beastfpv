'use client';

import { useState, useEffect, useCallback } from 'react';
import client from './ApolloClient'; // ✅ импортируем Apollo Client напрямую
import api from './api';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHydrated, setIsHydrated] = useState(false); // ✅ флаг гидрации

    const isAuthenticated = isHydrated && !!token;

    // ✅ Загрузка токена при монтировании компонента
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('wp_token');
            const savedRefreshToken = localStorage.getItem('wp_refresh_token');
            const savedUser = localStorage.getItem('wp_user');

            if (savedToken && savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);

                    setToken(savedToken);
                    setRefreshToken(savedRefreshToken || null);
                    setUser(parsedUser);

                    console.log('✅ Токен загружен из localStorage:', {
                        email: parsedUser.email,
                        name: parsedUser.name,
                    });
                } catch (parseErr) {
                    console.error('❌ Ошибка парсинга пользователя:', parseErr);
                    localStorage.removeItem('wp_user');
                }
            } else {
                console.log('⚠️ Токен не найден в localStorage');
            }
        } catch (err) {
            console.error('❌ Ошибка при загрузке токена:', err);
        } finally {
            setIsHydrated(true);
            setLoading(false);
        }
    }, []);

    // ✅ Функция входа (исправлена)
    const login = useCallback(async (username, password) => {
        setError(null);
        setLoading(true);

        try {
            console.log('📝 Попытка входа:', username);

            // ✅ Получаем GraphQL мутацию из API
            const loginMutation = api.loginAuth();

            // ✅ Вызываем мутацию через Apollo Client напрямую
            const { data, errors } = await client.mutate({
                mutation: loginMutation,
                variables: {
                    username,    // ✅ переменные отдельноыфыв
                    password
                }
            });

            console.log('📝 Ответ от сервера:', data);

            // ✅ Проверяем ошибки GraphQL
            if (errors && errors.length > 0) {
                console.error('❌ GraphQL ошибка:', errors);
                throw new Error(errors[0]?.message || 'Ошибка входа');
            }

            // ✅ Проверяем наличие данных входа
            const loginData = data?.login;

            if (!loginData) {
                throw new Error('Не получены данные входа от сервера');
            }

            if (!loginData.authToken) {
                throw new Error('authToken не получен');
            }

            console.log('✅ Вход успешен:', {
                id: loginData.user?.id,
                name: loginData.user?.name,
            });

            // ✅ Сохраняем данные в localStorage
            localStorage.setItem('wp_token', loginData.authToken);

            if (loginData.refreshToken) {
                localStorage.setItem('wp_refresh_token', loginData.refreshToken);
            }

            localStorage.setItem('wp_user', JSON.stringify(loginData.user));

            // ✅ Обновляем state
            setToken(loginData.authToken);
            setRefreshToken(loginData.refreshToken || null);
            setUser(loginData.user);
            setError(null);

            console.log('✅ Данные авторизации сохранены');

            return loginData;

        } catch (err) {
            const errorMessage = err.message || 'Ошибка входа. Проверьте учётные данные.';
            console.error('❌ Ошибка входа:', errorMessage);
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Функция выхода
    const logout = useCallback(() => {
        console.log('🚪 Выход из аккаунта');

        localStorage.removeItem('wp_token');
        localStorage.removeItem('wp_refresh_token');
        localStorage.removeItem('wp_user');

        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setError(null);

        console.log('✅ Данные авторизации удалены');
    }, []);

    // ✅ Функция обновления профиля
    const updateProfile = useCallback(async (userData) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('wp_user', JSON.stringify(updatedUser));
        console.log('✅ Профиль обновлён');
    }, [user]);

    // ✅ Функция для проверки валидности токена
    const checkTokenValidity = useCallback(async () => {
        if (!token) {
            console.warn('⚠️ Токен отсутствует');
            return false;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        query: `
                            query {
                                me {
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                    }),
                }
            );

            const data = await response.json();

            if (data.errors || !data.data?.me) {
                console.warn('⚠️ Токен больше не валиден');
                logout();
                return false;
            }

            console.log('✅ Токен валиден');
            return true;
        } catch (err) {
            console.error('❌ Ошибка проверки токена:', err);
            return false;
        }
    }, [token, logout]);

    return {
        user,
        token,
        refreshToken,
        loading,
        error,
        isHydrated,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        checkTokenValidity,
    };
}
