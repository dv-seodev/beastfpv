import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";

const Checkout = () => {
    return (
        <section className="checkout">
            <div className="container checkout__container">
                <h1 className="checkout__header">Оформление заказа</h1>
                <form className="checkout__form">
                    <div className="checkout__name-phone">
                        <div className="checkout__wrapper">
                            <p>ФИО</p>
                            <input className="checkout__form-input" type="text" name="name" />
                        </div>
                        <div className="checkout__wrapper">
                            <p>Телефон</p>
                            <input className="checkout__form-input" type="text" name="phone" />
                        </div>
                    </div>
                    <div className="checkout__wrapper">
                        <p>Город</p>
                        <input className="checkout__form-input" type="text" name="city" />
                    </div>
                    <div className="checkout__adress">
                        <div className="checkout__wrapper checkout__street">
                            <p>Улица</p>
                            <input className="checkout__form-input" type="text" name="street" />
                        </div>
                        <div className="checkout__wrapper checkout__house-ind">
                            <div className="checkout__wrapper">
                                <p>Дом</p>
                                <input className="checkout__form-input" type="text" name="house" />
                            </div>
                            <div className="checkout__wrapper">
                                <p>Квартира</p>
                                <input className="checkout__form-input" type="text" name="flat" />
                            </div>
                            <div className="checkout__wrapper">
                                <p>Индекс</p>
                                <input className="checkout__form-input" type="text" name="index" />
                            </div>
                        </div>
                    </div>
                    <div className="checkout__price">
                        Сумма заказа: <span>215 000</span> ₽
                    </div>
                    <div className="checkout__checkbox-wrapper">
                        <input type="checkbox" className="checkout__form-checkbox" />
                        <span>Я даю свое согласие на обработку своих персональных данных</span>
                    </div>
                    <button type="submit" className="checkout__form-button-submit">Перейти к оплате</button>
                </form >
                <NewItems />
            </div >
        </section >
    );
}

export default Checkout;