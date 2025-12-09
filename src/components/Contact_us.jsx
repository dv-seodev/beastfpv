'use client';

import { useState } from 'react';
import { formatPhoneNumber } from '../lib/phoneMask';
import './Contact_us.scss';

const contact_us = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: '',
    });

    // ✨ НОВАЯ ФУНКЦИЯ: обработчик изменения инпута
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // ✨ Если это поле телефона - применяем маску
        if (name === 'phone') {
            newValue = formatPhoneNumber(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Отправка формы:', formData);
        // Здесь отправляешь данные на бэк
    };

    return (
        <section className="contact-us">
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

                    <div className="contact-us__checkbox-wrapper">
                        <input type="checkbox" className="contact-us__form-checkbox" />
                        <span>Я даю свое согласие на обработку своих персональных данных</span>
                    </div>
                    <button type="submit" className="contact-us__form-button-submit">Заказать звонок</button>
                </form>
            </div>
        </section>
    );
}

export default contact_us;