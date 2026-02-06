"use client";

import Link from "next/link";
import { useEffect, useMemo, useCallback, useRef, useState } from "react";
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
import { usePaymentMethods } from "../../lib/usePaymentMethods";
import Loader from "../../components/Loader";


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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const { methods: paymentMethods } = usePaymentMethods();

  const items = cart?.items || [];
  const totals = cart?.totals || {};
  const coupons = cart?.coupons || [];

  const [shippingMethodUpdating, setShippingMethodUpdating] = useState(false);

  const paymentMethodsToRenderData = (methods) => {
    if (!methods || !Array.isArray(methods)) return {};
    const out = [];
    methods.map((key, index) => {
      const info = paymentMethodsInfo[key];
      if (info) out.push({ ...info, key });
    });
    return out;
  };

  const shippingMethods = getShippingMethods();

  const cartItems = useMemo(() => transformRestCartItems(items), [items]);
  const baseTotal = useMemo(() => (totals?.total_items ? parsePrice(totals.total_items) : 0), [totals?.total_items]);
  const finalTotal = useMemo(() => (totals?.total_price ? parsePrice(totals.total_price) : 0), [totals?.total_price]);
  const appliedCoupon = useMemo(() => coupons?.[0], [coupons]);
  const hasAppliedCoupon = !!appliedCoupon;

  const selectedShippingMethod = shippingMethods.find((method) => method.id === selectedShipping);

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
      setShippingMethodUpdating(true);
      setSelectedShipping(method.id);
      await setupShippingRate(method.id);
    } catch (err) {
      handleCartError(err, "❌ Ошибка при выборе способа доставки");
    } finally {
      setShippingMethodUpdating(false);
    }
  }, [setSelectedShipping, setupShippingRate]);

  useEffect(() => {
    if (paymentMethods?.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentMethods[0].id);
      console.log('selected payment', setSelectedPayment);
    }
  }, [paymentMethods, selectedPayment, setSelectedPayment]);

  useEffect(() => {
    const shippingMethod = selectedShippingMethod?.method || "";
    const isLocalPickup = shippingMethod.includes("pickup");
    const isCdek = shippingMethod.includes("cdek");

    const visibleMethods = paymentMethods.filter((method) => {
      if (isLocalPickup && method.id === "yookassa_epl") {
        return false;
      }
      if (isCdek && method.id === "cod") {
        return false;
      }
      return true;
    });

    if (visibleMethods.length > 0 && !visibleMethods.find(m => m.id === selectedPayment)) {
      setSelectedPayment(visibleMethods[0].id);
    }
  }, [selectedShippingMethod, paymentMethods, selectedPayment, setSelectedPayment]);

  const isLoading = useMemo(() => loading || cartLoading || !items, [loading, cartLoading, items]);
  const displayItems = useMemo(() => (cartItems.length > 0 ? cartItems : items), [cartItems, items]);
  const isDisabled = cartLoading;

  // --- Debounce logic for quantity changes ---
  const [localQuantities, setLocalQuantities] = useState({});
  const debounceTimersRef = useRef({});
  const pendingActionsRef = useRef({});
  const DEBOUNCE_MS = 2000;

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  useEffect(() => {
    setLocalQuantities((prev) => {
      const next = { ...prev };
      let changed = false;
      const itemKeys = new Set(displayItems.map((i) => i.key));

      displayItems.forEach((item) => {
        const pending = pendingActionsRef.current[item.key];
        if (!pending) {
          if (next[item.key] !== item.quantity) {
            next[item.key] = item.quantity;
            changed = true;
          }
        } else if (next[item.key] === undefined) {
          next[item.key] = item.quantity;
          changed = true;
        }
      });

      Object.keys(next).forEach((key) => {
        if (!itemKeys.has(key)) {
          delete next[key];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [displayItems]);

  const clearItemTimer = (itemKey) => {
    const timer = debounceTimersRef.current[itemKey];
    if (timer) {
      clearTimeout(timer);
      delete debounceTimersRef.current[itemKey];
    }
  };

  const commitItemAction = async (itemKey, fallbackQuantity = null) => {
    clearItemTimer(itemKey);
    const action = pendingActionsRef.current[itemKey];
    if (action) {
      delete pendingActionsRef.current[itemKey];
      if (action.type === "remove") {
        await handleRemoveItemWrapper(itemKey);
      } else if (action.type === "update") {
        await handleQuantityChangeWrapper(itemKey, action.quantity);
      }
      return;
    }

    if (fallbackQuantity !== null) {
      await handleQuantityChangeWrapper(itemKey, fallbackQuantity);
    }
  };

  const scheduleItemAction = (itemKey, action) => {
    pendingActionsRef.current[itemKey] = action;
    clearItemTimer(itemKey);

    debounceTimersRef.current[itemKey] = setTimeout(() => {
      commitItemAction(itemKey);
    }, DEBOUNCE_MS);
  };

  const normalizeQuantity = (value) => {
    if (!Number.isFinite(value)) return null;
    return Math.max(1, Math.floor(value));
  };

  const getDisplayQuantity = (item) => {
    const val = localQuantities[item.key];
    if (val === '' || val === undefined || val === null) return item.quantity;
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) ? parsed : item.quantity;
  };

  const handleQuantityInputChange = (item, rawValue) => {
    if (rawValue === '') {
      setLocalQuantities((prev) => ({ ...prev, [item.key]: '' }));
      clearItemTimer(item.key);
      delete pendingActionsRef.current[item.key];
      return;
    }

    const parsed = parseInt(rawValue, 10);
    const nextQuantity = normalizeQuantity(parsed);
    if (nextQuantity === null) return;

    setLocalQuantities((prev) => ({ ...prev, [item.key]: nextQuantity }));
    scheduleItemAction(item.key, { type: 'update', quantity: nextQuantity });
  };

  const handleQuantityCommit = (item) => {
    clearItemTimer(item.key);

    const raw = localQuantities[item.key];
    const parsed = parseInt(raw, 10);
    const nextQuantity = normalizeQuantity(parsed);

    if (nextQuantity === null) {
      setLocalQuantities((prev) => ({ ...prev, [item.key]: item.quantity }));
      delete pendingActionsRef.current[item.key];
      return;
    }

    if (nextQuantity === item.quantity) {
      delete pendingActionsRef.current[item.key];
      return;
    }

    pendingActionsRef.current[item.key] = { type: 'update', quantity: nextQuantity };
    commitItemAction(item.key);
  };

  const handleQuantityKeyDown = (item, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuantityCommit(item);
    }
  };

  const handleIncreaseQuantity = (item) => {
    const current = getDisplayQuantity(item);
    const newQuantity = normalizeQuantity(current + 1);
    setLocalQuantities((prev) => ({ ...prev, [item.key]: newQuantity }));
    scheduleItemAction(item.key, { type: 'update', quantity: newQuantity });
  };

  const handleDecreaseQuantity = (item) => {
    const current = getDisplayQuantity(item);
    const newQuantity = normalizeQuantity(current - 1);

    if (newQuantity < 1) {
      scheduleItemAction(item.key, { type: 'remove' });
      return;
    }

    setLocalQuantities((prev) => ({ ...prev, [item.key]: newQuantity }));
    scheduleItemAction(item.key, { type: 'update', quantity: newQuantity });
  };
  // --- end debounce logic ---

  if (isLoading) {
    return (
      <EmptyCartState>
        <Loader label="Загружаем" />
      </EmptyCartState>
    );
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
                          onClick={() => handleDecreaseQuantity(item)}
                          disabled={isDisabled}
                          title={
                            cartLoading
                              ? "Обновление..."
                              : getDisplayQuantity(item) === 1
                                ? "Удалить товар"
                                : "Уменьшить количество"
                          }
                        >
                          <img src="/images/minus.svg" alt="Уменьшить" />
                        </button>
                        <input
                          className="cart__product-count"
                          type="number"
                          min="1"
                          value={localQuantities[item.key] ?? item.quantity}
                          onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                          onBlur={() => handleQuantityCommit(item)}
                          onKeyDown={(e) => handleQuantityKeyDown(item, e)}
                          disabled={isDisabled}
                        />
                        <button
                          className="button cart__product-plus"
                          onClick={() => handleIncreaseQuantity(item)}
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
          <div className={`cart__right-section ${shippingMethodUpdating ? "is-updating" : ""}`}>
            <div className="cart__price-info">
              <h3 className="cart__price-heading">Сумма заказа</h3>
              <div className="cart__price-wrapper">
                <div className="cart__price-one cart__price-underline">
                  <span className="cart__price-name">Подытог:</span>
                  <span className="cart__price-numb">{formatPriceForDisplay(baseTotal)}</span>
                </div>

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

                <div className="cart__price-shipping">
                  <span className="cart__price-name">Способы оплаты:</span>
                  <div className="cart__checkbox-wrapper">
                    {paymentMethods?.length > 0 ? (
                      (() => {
                        const shippingMethod = selectedShippingMethod?.method || "";
                        const isLocalPickup = shippingMethod.includes("pickup");
                        const isCdek = shippingMethod.includes("cdek");

                        console.log(paymentMethods);
                        const visibleMethods = paymentMethods.filter((method) => {
                          if (isLocalPickup && method.id === "yookassa_epl") {
                            return false;
                          }
                          if (isCdek && method.id === "cod") {
                            return false;
                          }
                          return true;
                        });

                        return visibleMethods.map((method) => (
                          <div key={method.id} className="cart__checkbox-main">
                            <input
                              type="radio"
                              id={`payment-${method.id}`}
                              name="payment"
                              value={method.id}
                              checked={selectedPayment === method.id}
                              onChange={() => setSelectedPayment(method.id)}
                              className="cart__payment-checkbox cart__shipping-checkbox"
                            />
                            <label htmlFor={`payment-${method.id}`} style={{ cursor: "pointer" }}>
                              {method.title}
                            </label>
                          </div>
                        ));
                      })()
                    ) : (
                      <p>Методы оплаты недоступны</p>
                    )}
                  </div>
                </div>

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
