'use client';

import { useState, useEffect } from 'react';

export function useAccountController(token) {
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

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
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            console.log('📦 Загружаем профиль');

            const res = await fetch('/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

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
        // ✨ ВАЖНО: предотвращаем стандартное поведение формы
        e.preventDefault();
        e.stopPropagation();

        // ✨ Проверяем, что мы в режиме редактирования
        if (!isEditing) {
            console.log('⚠️ Не в режиме редактирования, игнорируем');
            return;
        }

        setSaving(true);

        try {
            console.log('💾 Сохраняем профиль:', formData);

            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error(`Ошибка ${res.status}`);

            const savedData = await res.json();
            console.log('✅ Профиль сохранён:', savedData);

            setProfileData(savedData);
            setIsEditing(false);
            alert('✅ Профиль успешно обновлён');
            await fetchProfile();
        } catch (error) {
            console.error('❌ Ошибка сохранения профиля:', error);
            alert('❌ Ошибка при сохранении профиля');
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (e) => {
        // ✨ Предотвращаем отправку формы
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('✏️ Начинаем редактирование');
        setIsEditing(true);
    };

    const handleCancelEdit = (e) => {
        // ✨ Предотвращаем отправку формы
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('❌ Отменяем редактирование');
        setIsEditing(false);
        if (profileData) {
            updateFormDataFromProfile(profileData);
        }
    };

    const handleFieldChange = (field, value) => {
        // ✨ Обновляем только если в режиме редактирования
        if (!isEditing) {
            console.log('⚠️ Поле заблокировано, игнорируем изменение');
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedFieldChange = (parent, field, value) => {
        // ✨ Обновляем только если в режиме редактирования
        if (!isEditing) {
            console.log('⚠️ Поле заблокировано, игнорируем изменение');
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
        handleSaveProfile,
        handleStartEdit,
        handleCancelEdit,
        handleFieldChange,
        handleNestedFieldChange,
    };
}
