"use client";

import Link from "next/link";
import { useEffect } from "react";
import "./page.scss";
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useCartStore } from "../../stores/cartStore";
import { useCartOperations } from "../../lib/hooks/useCartOperations";
import { useCartCoupon } from "../../lib/hooks/useCartCoupon";
import { formatPriceForDisplay, parsePrice } from "../../lib/utils/price";
import { getProductUrl, getProductImage } from "../../lib/utils/product";

const Cart = () => {
  const { data, loading, error } = useHomeData();
  const { selectedShipping, selectedPayment, setSelectedShipping, setSelectedPayment, items } = useCartStore();

  const {
    cartQuery,
    graphQLCart,
    cartItems,
    shippingMethods,
    paymentMethods,
    baseTotal,
    finalTotal,
    isUpdating,
    isClearing,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
  } = useCartOperations();

  const {
    couponCode,
    setCouponCode,
    couponMessage,
    isLoading: couponLoading,
    hasAppliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCartCoupon(cartQuery, graphQLCart);

  // Инициализация способов доставки
  useEffect(() => {
    if (shippingMethods?.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShipping, setSelectedShipping]);

  // Инициализация способов оплаты
  useEffect(() => {
    if (paymentMethods?.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPayment, setSelectedPayment]);

  // Состояния загрузки и ошибок
  const isLoading = loading || cartQuery.loading;
  const hasError = error || cartQuery.error;
  const displayItems = cartItems.length > 0 ? cartItems : items;

  if (isLoading) {
    return (
      <section className="cart">
        <div className="container cart__container">
          <h1 className="cart__header">Корзина</h1>
          <div className="cart__empty">
            <p>Загрузка...</p>
          </div>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="cart">
        <div className="container cart__container">
          <h1 className="cart__header">Корзина</h1>
          <div className="cart__empty">
            <p>❌ Ошибка: {error?.message || cartQuery.error?.message}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="cart">
        <div className="container cart__container">
          <h1 className="cart__header">Корзина</h1>
          <div className="cart__empty">
            <p>Нет данных</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayItems.length === 0) {
    return (
      <section className="cart">
        <div className="container cart__container">
          <h1 className="cart__header">Корзина</h1>
          <div className="cart__empty">
            <h4 className="checkout__header">Ваша корзина пуста</h4>
            <br />
            <Link href="/" className="continue-buy">
              Продолжить покупки
            </Link>
          </div>
          <NewItems products={data.new_products} />
        </div>
      </section>
    );
  }

  const appliedCoupon = graphQLCart?.appliedCoupons?.[0];
  const isDisabled = isClearing || isUpdating;

  return (
    <section className="cart">
      <div className="container cart__container">
        <h1 className="cart__header">Корзина</h1>

        <div className="cart__wrapper">
          {/* ЛЕВАЯ ЧАСТЬ - ТОВАРЫ */}
          <div className="cart__items">
            <div className="cart__items-list">
              <div className="cart__product-table-title">
                <span></span>
                <span className="title-price">цена</span>
                <span className="title-quantity">количество</span>
                <span className="title-total">итого</span>
                <span></span>
                <span></span>
              </div>

              {displayItems.map((item) => (
                <div key={item.key} className="cart__product-item">
                  <div className="cart__product-item-img">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = "/images/product_image.jpg";
                      }}
                    />
                  </div>
                  <div className="cart__product-item-inner">
                    <Link className="cart__product-item-link" href={getProductUrl(item)}>
                      <div className="cart__product-item-name">{item.name}</div>
                    </Link>
                    <div className="cart__product-item-inner-wrapper">
                      <div className="cart__product-item-price">{formatPriceForDisplay(item.price)}</div>
                      <div className="cart__product-quantity">
                        <button
                          className="button cart__product-minus"
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleRemoveItem(item.key);
                            } else {
                              handleQuantityChange(item.key, item.quantity - 1);
                            }
                          }}
                          disabled={isDisabled}
                          title={
                            isUpdating
                              ? "Обновление..."
                              : item.quantity === 1
                              ? "Удалить товар"
                              : "Уменьшить количество"
                          }
                        >
                          <img src="/images/minus.svg" alt="Уменьшить" />
                        </button>
                        <input className="cart__product-count" value={item.quantity} readOnly />
                        <button
                          className="button cart__product-plus"
                          onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                          disabled={isDisabled}
                          title={isUpdating ? "Обновление..." : "Увеличить количество"}
                        >
                          <img src="/images/plus.svg" alt="Увеличить" />
                        </button>
                      </div>
                      <div className="cart__product-item-final-price">{formatPriceForDisplay(item.total)}</div>
                    </div>
                  </div>
                  <button
                    className="cart__product-item-delete"
                    onClick={() => handleRemoveItem(item.key)}
                    disabled={isDisabled}
                    title={isUpdating ? "Удаление..." : "Удалить товар"}
                  >
                    <img src="/images/cart-delete.svg" alt="Удалить" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="cart__clear-button cart__coupon-submit"
              onClick={handleClearCart}
              disabled={isDisabled || displayItems.length === 0}
            >
              {isClearing ? "⏳ Очищаем..." : "Очистить корзину"}
            </button>
          </div>

          {/* ПРАВАЯ ЧАСТЬ - СУММА И МЕТОДЫ */}
          <div className="cart__right-section">
            <div className="cart__price-info">
              <h3 className="cart__price-heading">Сумма заказа</h3>
              <div className="cart__price-wrapper">
                <div className="cart__price-one cart__price-underline">
                  <span className="cart__price-name">Подитог:</span>
                  <span className="cart__price-numb">{formatPriceForDisplay(baseTotal)}</span>
                </div>

                {/* ПРИМЕНЁННЫЙ КУПОН */}
                {appliedCoupon && (
                  <div className="cart__price-discount cart__price-underline">
                    <span className="cart__price-name">Промокод ({appliedCoupon.code}):</span>
                    <span className="cart__price-numb action-price">
                      -{formatPriceForDisplay(parsePrice(appliedCoupon.discountAmount))}
                    </span>
                  </div>
                )}

                {couponMessage && (
                  <div
                    style={{
                      fontSize: "12px",
                      marginBottom: "10px",
                      color: couponMessage.includes("✅") ? "green" : "red",
                    }}
                  >
                    {couponMessage}
                  </div>
                )}

                {/* СПОСОБ ОПЛАТЫ */}
                <div className="cart__price-shipping">
                  <span className="cart__price-name">Способ оплаты:</span>
                  <div className="cart__checkbox-wrapper">
                    {paymentMethods?.length > 0 ? (
                      paymentMethods.map((method) => (
                        <div key={method.id} className="cart__checkbox-main">
                          <input
                            type="radio"
                            id={`payment-${method.id}`}
                            name="payment"
                            value={method.id}
                            checked={selectedPayment === method.id}
                            onChange={() => setSelectedPayment(method.id)}
                            className="cart__payment-checkbox cart__shipping-checkbox"
                            disabled={isDisabled}
                          />
                          <label htmlFor={`payment-${method.id}`} style={{ cursor: "pointer" }}>
                            {method.title}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p>Методы оплаты недоступны</p>
                    )}
                  </div>
                </div>

                {/* СПОСОБ ДОСТАВКИ */}
                <div className="cart__price-shipping">
                  <span className="cart__price-name">Способы доставки:</span>
                  <div className="cart__checkbox-wrapper">
                    {shippingMethods?.length > 0 ? (
                      shippingMethods.map((method) => (
                        <div key={method.id} className="cart__checkbox-main">
                          <input
                            type="radio"
                            id={`shipping-${method.id}`}
                            name="shipping"
                            value={method.id}
                            checked={selectedShipping === method.id}
                            onChange={() => setSelectedShipping(method.id)}
                            className="cart__shipping-checkbox"
                            disabled={isDisabled}
                          />
                          <label htmlFor={`shipping-${method.id}`} style={{ cursor: "pointer" }}>
                            {method.title}
                            {method.cost > 0 && ` (+${formatPriceForDisplay(method.cost)})`}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p>Методы доставки недоступны</p>
                    )}
                  </div>
                </div>

                <div className="cart__price-final">
                  <span className="cart__price-name price-bold">Итого:</span>
                  <span className="cart__price-numb">{formatPriceForDisplay(finalTotal)}</span>
                </div>
              </div>
            </div>

            <form
              className="cart__form"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              {/* БЛОК С КУПОНОМ */}
              <div className="cart__coupon-apply">
                <input
                  className="cart__coupon-input"
                  type="text"
                  placeholder="Введите купон"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !hasAppliedCoupon && applyCoupon()}
                  disabled={hasAppliedCoupon || couponLoading || isDisabled}
                />
                <button
                  type="button"
                  className="cart__coupon-submit"
                  onClick={hasAppliedCoupon ? removeCoupon : applyCoupon}
                  disabled={couponLoading || isDisabled}
                >
                  {couponLoading ? "Проверка..." : hasAppliedCoupon ? "Удалить купон" : "Применить"}
                </button>
              </div>

              <Link
                href="/checkout"
                className="cart__form-button-submit"
                style={{
                  display: "block",
                  textAlign: "center",
                  pointerEvents: isDisabled ? "none" : "auto",
                  opacity: isDisabled ? 0.6 : 1,
                }}
              >
                Перейти к оформлению
              </Link>
            </form>
          </div>
        </div>

        <NewItems products={data.new_products} />
      </div>
    </section>
  );
};

export default Cart;
