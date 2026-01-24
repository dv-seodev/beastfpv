'use client'

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useAuth } from "../../lib/useAuth";
import { useAccountController } from "../../lib/AccountController";
import Loader from "../../components/Loader";

const Account = () => {
    const router = useRouter();
    const { token, loading: authLoading, logout } = useAuth();
    const { data, loading: dataLoading } = useHomeData();

    const {
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
    } = useAccountController(token);

    console.log('profile data', profileData);

    useEffect(() => {
        if (!authLoading && !token) {
            router.push('/login/');
        }
    }, [token, authLoading, router]);

    if (authLoading) {
        return <Loader label="Загружаем" />;
    }

    if (!token) return null;
    if (dataLoading) return <Loader label="Загружаем" />;

    const { new_products } = data || {};

    const handleLogout = () => {
        logout();
        router.push('/login/');
    };

    return (
        <section className="account">
            <div className="container account__container">
                <h1 className="account__header">Личный кабинет</h1>

                <div className="account__nav">
                    <Link className="account__links-item account__link-active" href="/account/">
                        Профиль
                    </Link>
                    <Link className="account__links-item" href="/account/orders/">
                        Заказы
                    </Link>
                    <button className="account__links-item" onClick={handleLogout}>
                        Выйти
                    </button>
                </div>

                <div className="account__profile-section">
                    {profileLoading ? (
                        <div className="account__profile-loading">Загрузка профиля...</div>
                    ) : (
                        <form onSubmit={handleSaveProfile}>
                            {/* Основная информация */}
                            <div className="account__profile-card">
                                <h2 className="account__profile-title">
                                    Основная информация
                                </h2>
                                <div className="account__profile-grid">
                                    <div>
                                        <label className="account__profile-label">Имя:</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Фамилия:</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Email:</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Телефон:</label>
                                        <input
                                            type="tel"
                                            value={formData.billing.phone}
                                            onChange={(e) => handleNestedFieldChange('billing', 'phone', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Адрес доставки */}
                            <div className="account__profile-card">
                                <h2 className="account__profile-title">
                                    Адрес доставки
                                </h2>
                                <div className="account__profile-grid">
                                    <div>
                                        <label className="account__profile-label">Страна:</label>
                                        <input
                                            type="text"
                                            value={formData.shipping.country}
                                            onChange={(e) => handleNestedFieldChange('shipping', 'country', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Город:</label>
                                        <input
                                            type="text"
                                            value={formData.shipping.city}
                                            onChange={(e) => handleNestedFieldChange('shipping', 'city', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Область/Регион:</label>
                                        <input
                                            type="text"
                                            value={formData.shipping.state}
                                            onChange={(e) => handleNestedFieldChange('shipping', 'state', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Улица:</label>
                                        <input
                                            type="text"
                                            value={formData.shipping.address1}
                                            onChange={(e) => handleNestedFieldChange('shipping', 'address1', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Дом/Квартира:</label>
                                        <input
                                            type="text"
                                            value={formData.shipping.address2}
                                            onChange={(e) => handleNestedFieldChange('shipping', 'address2', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div>
                                        <label className="account__profile-label">Почтовый индекс:</label>
                                        <input
                                            type="text"
                                            value={formData.shipping.postcode}
                                            onChange={(e) => handleNestedFieldChange('shipping', 'postcode', e.target.value)}
                                            className="account__profile-input"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки */}
                            <div className="account__profile-actions">
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={handleStartEdit}
                                        className="account__profile-edit-btn"
                                    >
                                        Редактировать профиль
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="account__profile-save-btn"
                                        >
                                            {saving ? '💾 Сохранение...' : '💾 Сохранить'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="account__profile-cancel-btn"
                                        >
                                            Отмена
                                        </button>
                                    </>
                                )}
                            </div>

                        </form>
                    )}
                </div>

                <NewItems products={new_products} />
            </div>
        </section>
    );
}

export default Account;
