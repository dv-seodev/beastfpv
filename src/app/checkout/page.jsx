"use client";

import Link from "next/link";
import "./page.scss";
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatPhoneNumber } from "../../lib/phoneMask";
import { useAuth } from "../../lib/useAuth";
import CdekMap from "./cdekmap";
import wooRestApi from "../../lib/woo_rest_api/rest_api.js";
import { useRestCart } from "../../lib/hooks/useRestCart";
import { formatPriceForDisplay, parsePrice } from "../../lib/utils/price";
import {
  transformRestCartItems,
  transformRestShippingMethods,
  transformRestPaymentMethods,
  handleCartError,
} from "../../lib/utils/cart";

const EmptyCheckoutState = ({ title, children }) => (
  <section className="checkout">
    <div className="container checkout__container">
      <h1 className="checkout__header">Оформление заказа</h1>
      <div className="checkout__empty">
        {title && <p>{title}</p>}
        {children}
      </div>
    </div>
  </section>
);

const Checkout = () => {
  const router = useRouter();
  const { data, loading, error } = useHomeData();
  const { user } = useAuth();

  const { selectedShipping, selectedPayment, cart, fetchCart, loading: cartLoading, handleClearCart } = useRestCart();

  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCDEKOfficeID, setCDEKOfficeID] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    street: "",
    house: "",
    flat: "",
    index: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка данных корзины
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Проверка гидратации
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Заполняем email если пользователь авторизован
  useEffect(() => {
    if (isHydrated && user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [isHydrated, user]);

  // Преобразование данных с мемоизацией
  const items = cart?.items || [];
  const shipping_rates = cart?.shipping_rates || [];
  const payment_methods = cart?.payment_methods || [];
  const totals = cart?.totals || {};
  const coupons = cart?.coupons || [];

  const cartItems = useMemo(() => transformRestCartItems(items), [items]);
  const shippingMethods = useMemo(() => transformRestShippingMethods(shipping_rates), [shipping_rates]);
  const paymentMethods = useMemo(() => transformRestPaymentMethods(payment_methods), [payment_methods]);

  const baseTotal = useMemo(() => (totals?.total_items ? parsePrice(totals.total_items) : 0), [totals?.total_items]);

  const discountTotal = useMemo(
    () => (coupons?.[0]?.totals?.total_discount ? parsePrice(coupons[0].totals.total_discount) : 0),
    [coupons]
  );

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((m) => m.id === selectedShipping),
    [shippingMethods, selectedShipping]
  );

  const shippingCost = useMemo(() => selectedShippingMethod?.cost || 0, [selectedShippingMethod]);

  const finalTotal = useMemo(
    () => (totals?.total_price ? parsePrice(totals.total_price) : baseTotal - discountTotal + shippingCost),
    [totals?.total_price, baseTotal, discountTotal, shippingCost]
  );

  const selectedPaymentMethod = useMemo(
    () => paymentMethods.find((m) => m.id === selectedPayment),
    [paymentMethods, selectedPayment]
  );

  const isPickup = useMemo(
    () =>
      selectedShippingMethod?.id?.includes("pickup") ||
      selectedShippingMethod?.title?.toLowerCase().includes("самовывоз"),
    [selectedShippingMethod]
  );

  // Состояния загрузки
  const isLoading = useMemo(() => loading || cartLoading || !isHydrated, [loading, cartLoading, isHydrated]);

  // Обработчики - ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ДО РАННИХ ВОЗВРАТОВ
  const handlePVZSelect = useCallback((pvzData) => {
    setCDEKOfficeID(pvzData.code);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phone") {
      newValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Валидация телефона
      if (formData.phone.length < 18) {
        alert("Пожалуйста, введите полный номер телефона");
        return;
      }

      // Валидация адреса для доставки (кроме самовывоза)
      if (!isPickup && (!formData.city || !formData.street || !formData.house || !formData.index)) {
        alert("Пожалуйста, заполните все поля адреса");
        return;
      }

      // Валидация товаров
      if (cartItems.length === 0) {
        alert("Ошибка: В корзине нет товаров");
        return;
      }

      setIsSubmitting(true);

      try {
        const nameParts = formData.name.split(" ");
        const orderData = {
          billing_address: {
            first_name: nameParts[0] || "Customer",
            last_name: nameParts.slice(1).join(" ") || "",
            company: "",
            address_1: isPickup ? "Самовывоз" : `${formData.street} ${formData.house}`,
            address_2: isPickup ? "" : formData.flat || "",
            city: isPickup ? "Москва" : formData.city,
            state: "RU",
            postcode: isPickup ? "" : formData.index,
            country: "RU",
            email: formData.email || "guest@example.com",
            phone: formData.phone,
          },
          shipping_address: {
            first_name: nameParts[0] || "Customer",
            last_name: nameParts.slice(1).join(" ") || "",
            company: "",
            address_1: isPickup ? "Самовывоз" : `${formData.street} ${formData.house}`,
            address_2: isPickup ? "" : formData.flat || "",
            city: isPickup ? "Москва" : formData.city,
            state: "RU",
            postcode: isPickup ? "" : formData.index,
            country: "RU",
          },
          payment_method: selectedPayment || "bacs",
          payment_data: [],
          customer_note: "",
          create_account: false,
          extensions: selectedCDEKOfficeID
            ? {
                official_cdek: { office_code: selectedCDEKOfficeID },
              }
            : {},
        };

        const result = await wooRestApi.createOrder(orderData);

        if (!result || result.error) {
          throw new Error(result?.message || result?.error || "Ошибка при создании заказа");
        }

        if (result.orderId) {
          await handleClearCart();
          router.push(`/order-success/?orderId=${result.orderId}`);
        } else {
          throw new Error("Не удалось получить ID заказа");
        }
      } catch (err) {
        handleCartError(err, "Ошибка при создании заказа");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      isPickup,
      cartItems,
      items,
      selectedPayment,
      selectedPaymentMethod,
      selectedShippingMethod,
      shippingCost,
      selectedCDEKOfficeID,
      handleClearCart,
      router,
    ]
  );

  // Ранние возвраты ПОСЛЕ всех хуков
  if (isLoading) {
    return <EmptyCheckoutState title="Загрузка..." />;
  }

  if (error) {
    return <EmptyCheckoutState title={`❌ Ошибка: ${error?.message || "Неизвестная ошибка"}`} />;
  }

  if (!data) {
    return <EmptyCheckoutState title="Нет данных" />;
  }

  const { new_products } = data;

  // Проверка корзины после гидратации
  if (isHydrated && cartItems.length === 0) {
    return (
      <section className="checkout">
        <div className="container checkout__container">
          <h3 className="checkout__header">Ваша корзина пуста</h3>
          <Link className="continue-buy" href="/cart/">
            Продолжить покупки
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout">
      <div className="container checkout__container">
        <h1 className="checkout__header">Оформление заказа</h1>

        {/* Выбранные методы */}
        <div className="checkout__methods-wrapper">
          <div className="checkout__method">
            <p className="checkout__method-label">Выбранный способ оплаты:</p>
            <p className="checkout__method-value">
              <b>{selectedPaymentMethod?.title || "Не выбран"}</b>
            </p>
          </div>
          <div className="checkout__method">
            <p className="checkout__method-label">Выбранный способ доставки:</p>
            <p className="checkout__method-value">
              <b>{selectedShippingMethod?.title || "Не выбран"}</b>
            </p>
          </div>
          <div>
            <Link href="/cart/" className="checkout__change-link continue-buy">
              <b>Вернуться в корзину</b>
            </Link>
          </div>
        </div>

        <form className="checkout__form" onSubmit={handleSubmit}>
          {/* Статус авторизации */}
          {user && (
            <div
              className="checkout__auth-info"
              style={{
                padding: "10px 15px",
                backgroundColor: "#e8f5e9",
                borderLeft: "4px solid #4caf50",
                marginBottom: "20px",
                borderRadius: "4px",
              }}
            >
              <p style={{ margin: 0, color: "#2e7d32", fontSize: "14px" }}>
                ✅ Вы авторизованы как <strong>{user.email}</strong>
              </p>
            </div>
          )}

          {/* Всегда показываем: ФИО, Телефон, Email */}
          <div className="checkout__name-phone">
            <div className="checkout__wrapper">
              <p>ФИО</p>
              <input
                className="checkout__form-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="checkout__wrapper">
              <p>Телефон</p>
              <input
                className="checkout__form-input"
                type="tel"
                name="phone"
                placeholder="+7 (___) ___-__-__"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="checkout__wrapper">
              <p>Email</p>
              <input
                className="checkout__form-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required={!user}
              />
            </div>
          </div>

          {/* Условное отображение: Адрес только если это НЕ самовывоз */}
          {!isPickup && (
            <>
              <div className="checkout__wrapper">
                <p>Город</p>
                <input
                  className="checkout__form-input"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="checkout__adress">
                <div className="checkout__wrapper checkout__street">
                  <p>Улица</p>
                  <input
                    className="checkout__form-input"
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="checkout__wrapper checkout__house-ind">
                  <div className="checkout__wrapper">
                    <p>Дом</p>
                    <input
                      className="checkout__form-input"
                      type="text"
                      name="house"
                      value={formData.house}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="checkout__wrapper">
                    <p>Квартира</p>
                    <input
                      className="checkout__form-input"
                      type="text"
                      name="flat"
                      value={formData.flat}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="checkout__wrapper">
                    <p>Индекс</p>
                    <input
                      className="checkout__form-input"
                      type="text"
                      name="index"
                      value={formData.index}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Если самовывоз - показываем уведомление */}
          {isPickup && (
            <div className="checkout__pickup-notice">
              <p>
                📍 Вы выбрали <strong>самовывоз</strong> со склада.
              </p>
              <p>
                Адрес склада: <strong>Москва, пр-т. Мира, 102, стр. 31</strong>
              </p>
              <p>
                Режим работы: <strong>Пн-Пт: 9:00-21:00, Сб: 11:00-16:00, Вс: выходной</strong>
              </p>
            </div>
          )}

          {/* CDEK карта */}
          {!isPickup && <CdekMap onPVZselect={handlePVZSelect} />}

          {/* Отображение цены с доставкой */}
          <div className="checkout__price-breakdown">
            <div className="checkout__price-item">
              <span>
                <b>Подитог: </b>
              </span>
              <span>{formatPriceForDisplay(baseTotal)}</span>
            </div>

            {discountTotal > 0 && (
              <div className="checkout__price-item discount">
                <span>
                  <b>Скидка: </b>
                </span>
                <span>-{formatPriceForDisplay(discountTotal)}</span>
              </div>
            )}

            {!isPickup && shippingCost > 0 && (
              <div className="checkout__price-item">
                <span>
                  <b>Доставка: </b>
                </span>
                <span>{formatPriceForDisplay(shippingCost)}</span>
              </div>
            )}

            {isPickup && (
              <div className="checkout__price-item">
                <span>
                  <b>Доставка: </b>
                </span>
                <span>Бесплатно</span>
              </div>
            )}
          </div>

          <div className="checkout__price">
            Сумма заказа: <span>{formatPriceForDisplay(finalTotal)}</span>
          </div>

          <div className="checkout__checkbox-wrapper">
            <input type="checkbox" className="checkout__form-checkbox" defaultChecked required />
            <span>Я даю свое согласие на обработку своих персональных данных</span>
          </div>

          <button type="submit" className="checkout__form-button-submit" disabled={isSubmitting}>
            {isSubmitting ? "Обработка..." : "Перейти к оплате"}
          </button>
        </form>

        <NewItems products={new_products} />
      </div>
    </section>
  );
};

export default Checkout;
