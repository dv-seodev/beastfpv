"use client";

import Link from "next/link";
import { useEffect, useMemo, useCallback } from "react";
import "./page.scss";
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useRestCart } from "../../lib/hooks/useRestCart";
import { formatPriceForDisplay, parsePrice } from "../../lib/utils/price";
import { getProductUrl, getProductImage } from "../../lib/utils/product";
import {
  transformRestCartItems,
  transformRestShippingMethods,
  transformRestPaymentMethods,
  handleCartError,
} from "../../lib/utils/cart";
import { title } from "process";
import { usePaymentMethods } from "../../lib/usePaymentMethods";

const EmptyCartState = ({ title, children }) => (
  <section className="cart">
    <div className="container cart__container">
      <h1 className="cart__header">Корзина</h1>
      <div className="cart__empty">
        {title && <p>{title}</p>}
        {children}
      </div>
    </div>
  </section>
);

const Cart = () => {
  const { data, loading } = useHomeData();
  const {
    selectedShipping,
    selectedPayment,
    setSelectedShipping,
    setSelectedPayment,
    cart,
    handleQuantityChange,
    handleRemoveItem,
    handleClearCart,
    fetchCart,
    loading: cartLoading,
    couponCode,
    couponMessage,
    couponLoading,
    setCouponCode,
    applyCoupon,
    removeCoupon,
    getShippingMethods,
    setupShippingRate,
  } = useRestCart();

  const { methods: paymentMethods } = usePaymentMethods();

  const items = cart?.items || [];
  const totals = cart?.totals || {};
  const coupons = cart?.coupons || [];

  // Загрузка данных корзины
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const paymentMethodsToRenderData = (methods) => {
    if (!methods || !Array.isArray(methods)) return {};
    const out = [];
    methods.map((key, index) => {
      const info = paymentMethodsInfo[key];
      if (info) out.push({ ...info, key });
    });
    return out;
  };

  // Преобразование данных с мемоизацией
  const shippingMethods = getShippingMethods();
  const cartItems = useMemo(() => transformRestCartItems(items), [items]);
  const baseTotal = useMemo(() => (totals?.total_items ? parsePrice(totals.total_items) : 0), [totals?.total_items]);
  const finalTotal = useMemo(() => (totals?.total_price ? parsePrice(totals.total_price) : 0), [totals?.total_price]);
  const appliedCoupon = useMemo(() => coupons?.[0], [coupons]);
  const hasAppliedCoupon = !!appliedCoupon;

  // Обработчики с мемоизацией и обработкой ошибок
  const handleQuantityChangeWrapper = useCallback(
    async (itemKey, newQuantity) => {
      try {
        await handleQuantityChange(itemKey, newQuantity);
      } catch (err) {
        handleCartError(err, "❌ Ошибка при изменении количества товара");
      }
    },
    [handleQuantityChange]
  );

  const handleRemoveItemWrapper = useCallback(
    async (itemKey) => {
      try {
        await handleRemoveItem(itemKey);
      } catch (err) {
        handleCartError(err, "❌ Ошибка при удалении товара из корзины");
      }
    },
    [handleRemoveItem]
  );

  const handleClearCartWrapper = useCallback(async () => {
    try {
      await handleClearCart();
    } catch (err) {
      handleCartError(err, "❌ Ошибка при очистке корзины");
    }
  }, [handleClearCart]);

  const handleApplyCoupon = useCallback(async () => {
    try {
      await applyCoupon(couponCode);
    } catch (err) {
      // Ошибка уже обработана в useRestCart
    }
  }, [applyCoupon, couponCode]);

  const handleRemoveCoupon = useCallback(async () => {
    if (!appliedCoupon) return;
    try {
      await removeCoupon(appliedCoupon.code);
    } catch (err) {
      handleCartError(err, "Ошибка при удалении купона");
    }
  }, [removeCoupon, appliedCoupon]);

  const handleImageError = useCallback((e) => {
    e.target.src = "/images/product_image.jpg";
  }, []);

  const onDeliveryMethodChange = useCallback(async (method) => {
    try {
      console.log("[onDeliveryMethodChange =====>] method", method);
      await setupShippingRate(method.id);
      setSelectedShipping(method.id);
    } catch (err) {
      handleCartError(err, "❌ Ошибка при выборе способа доставки");
    }
  }, []);

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

  // Состояния загрузки
  const isLoading = useMemo(() => loading || cartLoading || !items, [loading, cartLoading, items]);
  const displayItems = useMemo(() => (cartItems.length > 0 ? cartItems : items), [cartItems, items]);
  const isDisabled = cartLoading;

  if (isLoading) {
    return <EmptyCartState title="Загрузка..." />;
  }

  if (!data) {
    return <EmptyCartState title="Нет данных" />;
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
                    <img src={getProductImage(item)} alt={item.name} onError={handleImageError} />
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
                              handleRemoveItemWrapper(item.key);
                            } else {
                              handleQuantityChangeWrapper(item.key, item.quantity - 1);
                            }
                          }}
                          disabled={isDisabled}
                          title={
                            cartLoading
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
                          onClick={() => handleQuantityChangeWrapper(item.key, item.quantity + 1)}
                          disabled={isDisabled}
                          title={cartLoading ? "Обновление..." : "Увеличить количество"}
                        >
                          <img src="/images/plus.svg" alt="Увеличить" />
                        </button>
                      </div>
                      <div className="cart__product-item-final-price">{formatPriceForDisplay(item.total)}</div>
                    </div>
                  </div>
                  <button
                    className="cart__product-item-delete"
                    onClick={() => handleRemoveItemWrapper(item.key)}
                    disabled={isDisabled}
                    title={cartLoading ? "Удаление..." : "Удалить товар"}
                  >
                    <img src="/images/cart-delete.svg" alt="Удалить" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="cart__clear-button cart__coupon-submit"
              onClick={handleClearCartWrapper}
              disabled={isDisabled || displayItems.length === 0}
            >
              {cartLoading ? "⏳ Очищаем..." : "Очистить корзину"}
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
                      -{formatPriceForDisplay(parsePrice(appliedCoupon.totals?.total_discount || "0"))}
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
                            onChange={() => onDeliveryMethodChange(method)}
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
                  onKeyDown={(e) => e.key === "Enter" && !hasAppliedCoupon && handleApplyCoupon()}
                  disabled={hasAppliedCoupon || couponLoading || isDisabled}
                />
                <button
                  type="button"
                  className="cart__coupon-submit"
                  onClick={hasAppliedCoupon ? handleRemoveCoupon : handleApplyCoupon}
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
