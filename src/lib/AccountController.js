'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useAccountController() {
    const { token, logout, isHydrated } = useAuth();
    const router = useRouter();

    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('success');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        billing: {
            phone: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
        },
        shipping: {
            address1: '',
            address2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
        }
    });

    useEffect(() => {
        if (token && isHydrated) {
            fetchProfile();
        }
    }, [token, isHydrated]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProfile = async () => {
        if (!token) return;

        try {
            console.log('📦 Загружаем профиль');

            const res = await fetch('/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                console.warn('⚠️ Токен невалиден или протух (401)');
                logout();
                router.push('/login/');
                return;
            }

            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const data = await res.json();
            console.log('✅ Профиль загружен:', data);

            setProfileData(data);
            updateFormDataFromProfile(data);
        } catch (error) {
            console.error('❌ Ошибка загрузки профиля:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const updateFormDataFromProfile = (data) => {
        setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            billing: {
                phone: data.billing?.phone || '',
                address1: data.billing?.address1 || '',
                address2: data.billing?.address2 || '',
                city: data.billing?.city || '',
                state: data.billing?.state || '',
                postcode: data.billing?.postcode || '',
                country: data.billing?.country || '',
            },
            shipping: {
                address1: data.shipping?.address1 || '',
                address2: data.shipping?.address2 || '',
                city: data.shipping?.city || '',
                state: data.shipping?.state || '',
                postcode: data.shipping?.postcode || '',
                country: data.shipping?.country || '',
            }
        });
    };

    const handleSaveProfile = async (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (!isEditing) {
            console.log('⚠️ Не в режиме редактирования');
            return;
        }

        setSaving(true);

        try {
            console.log('💾 Сохраняем профиль:', JSON.stringify(formData, null, 2));

            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const savedData = await res.json();

            console.log('📦 Response status:', res.status);
            console.log('📦 Response data:', JSON.stringify(savedData, null, 2));

            if (!res.ok) {
                const errorMsg = savedData.error || `Ошибка ${res.status}`;
                console.error('❌ API error:', errorMsg);
                throw new Error(errorMsg);
            }

            console.log('✅ Профиль сохранён:', savedData);

            setProfileData(savedData);
            setIsEditing(false);

            setMessageType('success');
            setMessage('✅ Профиль успешно обновлён');

            await fetchProfile();
        } catch (error) {
            console.error('❌ Ошибка сохранения профиля:', error);

            setMessageType('error');
            setMessage(`❌ Ошибка: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        console.log('✏️ Начинаем редактирование');
        setIsEditing(true);
    };

    const handleCancelEdit = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        console.log('❌ Отменяем редактирование');
        setIsEditing(false);
        if (profileData) {
            updateFormDataFromProfile(profileData);
        }
    };

    const handleFieldChange = (field, value) => {
        if (!isEditing) {
            console.log('⚠️ Поле заблокировано');
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedFieldChange = (parent, field, value) => {
        if (!isEditing) {
            console.log('⚠️ Поле заблокировано');
            return;
        }
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    return {
        profileData,
        profileLoading,
        isEditing,
        saving,
        formData,
        message,
        messageType,
        handleSaveProfile,
        handleStartEdit,
        handleCancelEdit,
        handleFieldChange,
        handleNestedFieldChange,
    };
}
