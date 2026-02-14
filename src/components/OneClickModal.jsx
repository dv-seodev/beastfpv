'use client';

import { useEffect, useState } from 'react';
import { formatPhoneNumber } from '../lib/phoneMask';
import { submitLeadForm, validateLeadForm } from '../lib/formLeads';
import Link from 'next/link';

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
        website: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState('idle');
    const isFormReady = !validateLeadForm({
        name: formData.name,
        phone: formData.phone,
        agree: formData.agree,
    });
    const isButtonDisabled = isSubmitting || !isFormReady;

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            product_name: getProductNameForForm(product, isPreorder),
        }));
    }, [product, isPreorder]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = value;

        if (name === 'phone') {
            newValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : newValue,
        }));

        if (submitState !== 'idle') {
            setSubmitState('idle');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateLeadForm({
            name: formData.name,
            phone: formData.phone,
            agree: formData.agree,
        });

        if (validationError) {
            setSubmitState('error');
            return;
        }

        setSubmitState('sending');
        setIsSubmitting(true);

        try {
            await submitLeadForm({
                formType: isPreorder ? 'preorder' : 'one_click',
                name: formData.name,
                phone: formData.phone,
                agree: formData.agree,
                honeypot: formData.website,
                extra: {
                    product_name: formData.product_name || '',
                    product_id: product?.databaseId || product?.id || '',
                    product_price: product?.price || '',
                },
            });

            setSubmitState('success');
            setFormData({
                product_name: getProductNameForForm(product, isPreorder),
                name: '',
                phone: '',
                agree: false,
                website: '',
            });
            setTimeout(onClose, 1500);
        } catch (err) {
            console.error('Ошибка отправки формы:', err);
            setSubmitState('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const buttonTextByState = {
        idle: 'Заказать',
        sending: 'Отправка...',
        success: 'Ваша заявка успешно отправлена',
        error: 'Не удалось отправить заявку',
    };

    const buttonStyleByState = {
        success: {
            backgroundColor: 'var(--green)',
        },
        error: {
            backgroundColor: 'var(--red)',
        },
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

                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        autoComplete="off"
                        tabIndex="-1"
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            left: '-9999px',
                            width: 0,
                            height: 0,
                            opacity: 0,
                            pointerEvents: 'none',
                        }}
                    />

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
                            <span>Я даю свое согласие на <Link href="/politika-konfidencialnosti.pdf" target="_blank" style={{ textDecoration: "underline" }}>обработку своих персональных данных</Link></span>
                        </label>
                    </div>

                    {/* Кнопка */}
                    <button
                        type="submit"
                        className="contact-us-modal__button contact-us__form-button-submit contact-us-modal__button--submit"
                        disabled={isButtonDisabled}
                        style={{
                            ...(buttonStyleByState[submitState] || {}),
                            ...(isButtonDisabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                        }}
                    >
                        {buttonTextByState[submitState] || buttonTextByState.idle}
                    </button>
                </form>
            </div>
        </div>
    );
}
