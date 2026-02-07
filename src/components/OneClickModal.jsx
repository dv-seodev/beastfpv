'use client';

import { useEffect, useState } from 'react';
import { formatPhoneNumber } from '../lib/phoneMask'; // ✨ ДОБАВЛЯЕМ ИМПОРТ

const getProductNameForForm = (product, isPreorder) => {
    const name = product?.name || '';
    if (!name) return '';
    return isPreorder ? `Предзаказ - ${name}` : name;
};

export default function OneClickModal({ product, isOpen, onClose, isPreorder = false }) {
    const [formData, setFormData] = useState({
        product_name: getProductNameForForm(product, isPreorder),
        name: '',
        phone: '',
        agree: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            product_name: getProductNameForForm(product, isPreorder),
        }));
    }, [product, isPreorder]);

    if (!isOpen) return null;

    // ✨ ОБНОВЛЁННЫЙ ОБРАБОТЧИК: с маской для телефона
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = value;

        // ✨ Применяем маску для телефона
        if (name === 'phone') {
            newValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : newValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.name.trim()) {
                alert('Заполните имя');
                setIsSubmitting(false);
                return;
            }

            if (!formData.phone.trim()) {
                alert('Заполните телефон');
                setIsSubmitting(false);
                return;
            }

            if (!formData.agree) {
                alert('Согласитесь на обработку данных');
                setIsSubmitting(false);
                return;
            }

            // Отправляем заказ
            const response = await fetch('/api/one-click-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    product_name: formData.product_name,
                    product_price: product.price,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                }),
            });

            if (!response.ok) throw new Error('Ошибка при отправке');

            alert('✅ Спасибо! Мы свяжемся с вами в ближайшее время');
            setFormData({
                product_name: getProductNameForForm(product, isPreorder),
                name: '',
                phone: '',
                agree: false,
            });
            setTimeout(onClose, 1500);
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`❌ ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content contact-us" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <form onSubmit={handleSubmit} className="contact-us-modal__form">
                    {/* Название товара (задизейблено) */}
                    <div className="contact-us-modal__form-group">
                        <label className="contact-us-modal__label">Товар</label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            disabled
                            className="contact-us-modal__form-input contact-us-modal__form-input--disabled"
                        />
                    </div>

                    {/* Имя */}
                    <div className="contact-us-modal__form-group">
                        <label className="contact-us-modal__label" htmlFor="name">
                            Ваше имя <span className="contact-us-modal__required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="contact-us-modal__form-input"
                            required
                        />
                    </div>

                    {/* ✨ ТЕЛЕФОН С МАСКОЙ */}
                    <div className="contact-us-modal__form-group">
                        <label className="contact-us-modal__label" htmlFor="phone">
                            Телефон <span className="contact-us-modal__required">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="contact-us-modal__form-input"
                            required
                        />
                    </div>

                    {/* Согласие */}
                    <div className="contact-us-modal__form-group contact-us-modal__checkbox-group">
                        <label className="contact-us-modal__checkbox-label">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleInputChange}
                                className="contact-us-modal__checkbox"
                            />
                            <span>Я даю согласие на обработку персональных данных <span className="contact-us-modal__required">*</span></span>
                        </label>
                    </div>

                    {/* Кнопка */}
                    <button
                        type="submit"
                        className="contact-us-modal__button contact-us__form-button-submit contact-us-modal__button--submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Отправка...' : 'Заказать'}
                    </button>
                </form>
            </div>
        </div>
    );
}
