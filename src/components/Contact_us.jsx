'use client';

import { useState } from 'react';
import { formatPhoneNumber } from '../lib/phoneMask';
import { submitLeadForm, validateLeadForm } from '../lib/formLeads';
import './Contact_us.scss';
import Link from 'next/link';

const trackYandexLeadGoal = () => {
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
        window.ym(96745068, 'reachGoal', 'zayavka');
    }
};

const contact_us = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: '',
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
                formType: 'callback',
                name: formData.name,
                phone: formData.phone,
                agree: formData.agree,
                honeypot: formData.website,
                extra: {
                    message: formData.message?.trim() || '',
                },
            });
            trackYandexLeadGoal();

            setSubmitState('success');
            setFormData({
                name: '',
                phone: '',
                message: '',
                agree: false,
                website: '',
            });
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            setSubmitState('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const buttonTextByState = {
        idle: 'Заказать звонок',
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
        <section className="contact-us" id='contact-us'>
            <div className="container contact-us__container">
                <div className="contact-us__header">
                    <h2>Ответим на все ваши вопросы</h2>
                    <p>Оставьте ваши контактные данные и мы вам перезвоним</p>
                </div>
                <form className="contact-us__form" onSubmit={handleSubmit}>
                    <p>Как к вам можно обращаться?</p>
                    <input
                        className="contact-us__form-input"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />

                    <p>Ваш контактный номер телефона</p>
                    <input
                        className="contact-us__form-input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                    />

                    <p>Ваше сообщение</p>
                    <input
                        className="contact-us__form-input"
                        type="text"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                    />

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

                    <div className="contact-us__checkbox-wrapper">
                        <input
                            type="checkbox"
                            className="contact-us__form-checkbox"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleInputChange}
                        />
                        <span>Я даю свое согласие на <Link href="/soglasie-obrabotka-pers-dannyh.pdf" target="_blank" style={{ textDecoration: "underline" }}>обработку своих персональных данных</Link></span>
                    </div>
                    <button
                        type="submit"
                        className="contact-us__form-button-submit"
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
        </section>
    );
}

export default contact_us;
