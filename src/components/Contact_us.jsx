import './Contact_us.scss';

const contact_us = () => {
    return (
        <section className="contact-us">
            <div className="container contact-us__container">
                <div className="contact-us__header">
                    <h2>Ответим на все ваши вопросы</h2>
                    <p>Оставьте ваши контактные данные и мы вам перезвоним</p>
                </div>
                <form className="contact-us__form">
                    <p>Как к вам можно обращаться?</p>
                    <input className="contact-us__form-input" type="text" name="name" />
                    <p>Ваш контактный номер телефона</p>
                    <input className="contact-us__form-input" type="text" name="phone" />
                    <p>Ваше сообщение</p>
                    <input className="contact-us__form-input" type="text" name="message" />
                    <div className="contact-us__checkbox-wrapper">
                        <input type="checkbox" className="contact-us__form-checkbox" />
                        <span>Я даю свое согласие на обработку своих персональных данных</span>
                    </div>
                    <button type="submit" className="contact-us__form-button-submit">Заказать звонок</button>
                </form>
            </div >
        </section >
    );
}

export default contact_us;