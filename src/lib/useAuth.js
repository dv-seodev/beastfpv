// lib/useAuth.js

'use client';

import { useAuthStore } from "../stores/authStore";
import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Проверяем токен при загрузке
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (savedToken) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                console.log('✅ Токен загружен из localStorage');
            }
        } catch (err) {
            console.error('❌ Ошибка при загрузке токена:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Функция входа
    const login = useCallback(async (username, password) => {
        setError(null);
        setLoading(true);

        try {
            console.log('📝 Попытка входа:', username);

            const response = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка входа');
            }

            console.log('✅ Успешный вход:', data.user);

            // ✅ Сохраняем в localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // ✅ Обновляем состояние
            setToken(data.token);
            setUser(data.user);

            return data;
        } catch (err) {
            console.error('❌ Ошибка входа:', err.message);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Функция выхода
    const logout = useCallback(() => {
        console.log('🚪 Выход');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
    }, []);

    // ✅ Функция обновления профиля
    const updateProfile = useCallback(async (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    }, [user]);

    return {
        user,
        token,
        loading,
        error,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!token,
    };
}
