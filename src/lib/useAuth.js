'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAuthenticated = !!token;

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('wp_token');
            const savedRefreshToken = localStorage.getItem('wp_refresh_token');
            const savedUser = localStorage.getItem('wp_user');

            if (savedToken && savedUser) {
                setToken(savedToken);
                setRefreshToken(savedRefreshToken);
                setUser(JSON.parse(savedUser));
                console.log('✅ Токен загружен из localStorage');
            }
        } catch (err) {
            console.error('❌ Ошибка при загрузке токена:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (username, password) => {
        setError(null);
        setLoading(true);

        try {
            console.log('🔐 Логинимся через GraphQL JWT...');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/graphql`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                            mutation Login($username: String!, $password: String!) {
                                login(input: { username: $username, password: $password }) {
                                    authToken
                                    refreshToken
                                    user {
                                        id
                                        databaseId
                                        name
                                        email
                                    }
                                }
                            }
                        `,
                        variables: { username, password },
                    }),
                }
            );

            const data = await response.json();

            if (data.errors) {
                console.error('❌ GraphQL error:', data.errors);
                throw new Error(data.errors[0].message || 'Ошибка входа');
            }

            const loginData = data.data?.login;

            if (!loginData?.authToken) {
                throw new Error('authToken не получен');
            }

            console.log('✅ Успешный вход:', {
                id: loginData.user.databaseId,
                email: loginData.user.email,
            });

            localStorage.setItem('wp_token', loginData.authToken);
            localStorage.setItem('wp_refresh_token', loginData.refreshToken);
            localStorage.setItem('wp_user', JSON.stringify(loginData.user));

            setToken(loginData.authToken);
            setRefreshToken(loginData.refreshToken);
            setUser(loginData.user);

            return loginData;
        } catch (err) {
            console.error('❌ Ошибка входа:', err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        console.log('🚪 Выход');
        localStorage.removeItem('wp_token');
        localStorage.removeItem('wp_refresh_token');
        localStorage.removeItem('wp_user');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setError(null);
    }, []);

    return {
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
    };
}
