'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";

const Cart = () => {
    const { data, loading, error } = useHomeData();

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!data) return <div>Нет данных</div>;

    const { new_products, pop_products, cats_list } = data;

    return (
        <section className="cart">
            <div className="container cart__container">
                <h1 className="cart__header">Корзина</h1>
                <div className="cart__wrapper">
                    <div className="cart__items">

                        <div className="cart__items-list">
                            <div className="cart__product-table-title">
                                <span></span>
                                <span>цена</span>
                                <span>количество</span>
                                <span>итого</span>
                                <span></span>
                            </div>
                            <div className="cart__product-item">
                                <div className="cart__product-item-img"><img src="/images/product_image.jpg" /></div>
                                <div className="cart__product-item-inner">
                                    <Link className="cart__product-item-link" href="/">
                                        <div className="cart__product-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                                    </Link>
                                    <div className="cart__product-item-inner-wrapper">
                                        <div className="cart__product-item-price">85 000 ₽</div>
                                        <div className="cart__product-quantity">
                                            <button className="button cart__product-minus"><img src="/images/minus.svg" /></button>
                                            <input className="cart__product-count" placeholder="1"></input>
                                            <button className="button cart__product-plus"><img src="/images/plus.svg" /></button>
                                        </div>
                                        <div className="cart__product-item-final-price">85 000 ₽</div>
                                    </div>
                                </div>
                                <button className="cart__product-item-delete" ><img src="/images/cart-delete.svg" /></button>
                            </div>
                        </div>


                    </div>
                    <div className="cart__right-section">
                        <div className="cart__price-info">
                            <h3 className="cart__price-heading">Сумма заказа</h3>
                            <div className="cart__price-wrapper">
                                <div className="cart__price-one cart__price-underline">
                                    <span className="cart__price-name">Подитог:</span>
                                    <span className="cart__price-numb">235 000 ₽</span>
                                </div>
                                <div className="cart__price-discount cart__price-underline">
                                    <span className="cart__price-name">Купон:</span>
                                    <span className="cart__price-numb action-price">-20 000 ₽</span>
                                </div>
                                <div className="cart__price-shipping">
                                    <span className="cart__price-name">Доставка:</span>
                                    <div className="cart__checkbox-wrapper">
                                        <div className="cart__checkbox-main">
                                            <input type="checkbox" className="cart__shipping-checkbox" />
                                            <span>Курьер (+500₽)</span>
                                        </div>
                                        <div className="cart__checkbox-main">
                                            <input type="checkbox" className="cart__shipping-checkbox" />
                                            <span>Пункт выдачи (+100₽)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="cart__price-final">
                                    <span className="cart__price-name price-bold">Итого:</span>
                                    <span className="cart__price-numb">215 000 ₽</span>
                                </div>
                            </div>
                        </div>
                        <form className="cart__form" action="">
                            <div className="cart__coupon-apply">
                                <input className="cart__coupon-input" type="text" />
                                <button className="cart__coupon-submit">Применить</button>
                            </div>
                            <button type="submit" className="cart__form-button-submit">Оформить заказ</button>
                        </form>
                    </div>
                </div>
                <NewItems products={new_products} />
            </div >
        </section >
    );
}

export default Cart;