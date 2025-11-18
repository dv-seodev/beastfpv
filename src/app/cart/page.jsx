'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useCartStore } from "../../stores/cartStore";

const Cart = () => {
    const { data, loading, error } = useHomeData();

    // Получаем данные из корзины
    const {
        items,
        removeItem,
        updateQuantity,
        totalPrice,
        clearCart
    } = useCartStore();

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!data) return <div>Нет данных</div>;

    const { new_products, pop_products, cats_list } = data;


    // Если корзина пустая
    if (items.length === 0) {
        return (
            <section className="cart">
                <div className="container cart__container">
                    <h1 className="cart__header">Корзина</h1>
                    <div className="cart__empty">
                        <p>Ваша корзина пуста</p>
                        <Link href="/catalog" className="cart__continue-shopping">
                            Продолжить покупки
                        </Link>
                    </div>
                    <NewItems products={new_products} />
                </div>
            </section>
        );
    }

    // Функция для изменения количества
    const handleQuantityChange = (id, newQuantity) => {
        if (newQuantity < 1) return;
        updateQuantity(id, newQuantity);
    };

    // Функция для удаления товара
    const handleRemoveItem = (id) => {
        removeItem(id);
    };

    const formatPriceForDisplay = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };


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

                            {/* ВЫВОДИМ РЕАЛЬНЫЕ ТОВАРЫ ИЗ КОРЗИНЫ */}
                            {items.map((item) => (
                                <div key={item.id} className="cart__product-item">
                                    <div className="cart__product-item-img">
                                        <img
                                            src={item.image || "/images/product_image.jpg"}
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="cart__product-item-inner">
                                        <Link className="cart__product-item-link" href={`/product/${item.slug || '#'}`}>
                                            <div className="cart__product-item-name">{item.name}</div>
                                        </Link>
                                        <div className="cart__product-item-inner-wrapper">
                                            <div className="cart__product-item-price">
                                                {formatPriceForDisplay(item.price)}
                                            </div>
                                            <div className="cart__product-quantity">
                                                <button
                                                    className="button cart__product-minus"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                >
                                                    <img src="/images/minus.svg" alt="Уменьшить" />
                                                </button>
                                                <input
                                                    className="cart__product-count"
                                                    value={item.quantity}
                                                    readOnly
                                                />
                                                <button
                                                    className="button cart__product-plus"
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                >
                                                    <img src="/images/plus.svg" alt="Увеличить" />
                                                </button>
                                            </div>
                                            <div className="cart__product-item-final-price">
                                                {formatPriceForDisplay(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="cart__product-item-delete"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        <img src="/images/cart-delete.svg" alt="Удалить" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="cart__right-section">
                        <div className="cart__price-info">
                            <h3 className="cart__price-heading">Сумма заказа</h3>
                            <div className="cart__price-wrapper">
                                <div className="cart__price-one cart__price-underline">
                                    <span className="cart__price-name">Подитог:</span>
                                    <span className="cart__price-numb">{formatPriceForDisplay(totalPrice())}</span>
                                </div>
                                <div className="cart__price-discount cart__price-underline">
                                    <span className="cart__price-name">Купон:</span>
                                    <span className="cart__price-numb action-price">-0 ₽</span>
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
                                    <span className="cart__price-numb">{formatPriceForDisplay(totalPrice())}</span>
                                </div>
                            </div>
                        </div>
                        <form className="cart__form" action="">
                            <div className="cart__coupon-apply">
                                <input className="cart__coupon-input" type="text" placeholder="Введите купон" />
                                <button className="cart__coupon-submit">Применить</button>
                            </div>
                            <button type="submit" className="cart__form-button-submit">
                                Оформить заказ
                            </button>
                            <button
                                type="button"
                                className="cart__clear-button"
                                onClick={clearCart}
                            >
                                Очистить корзину
                            </button>
                        </form>
                    </div>
                </div>
                <NewItems products={new_products} />
            </div>
        </section>
    );
}

export default Cart;