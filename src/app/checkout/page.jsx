"use client";

import "./page.scss";
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useMemo } from "react";
import CdekMap from "./cdekmap";
import { useRestCart } from "../../lib/hooks/useRestCart";
import { Formik } from "formik";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  EmptyCheckoutState,
  CheckoutMethodsInfo,
  CheckoutAuthInfo,
  CheckoutContactForm,
  CheckoutAddressForm,
  CheckoutPickupNotice,
  CheckoutPriceBreakdown,
  CheckoutSubmitSection,
} from "../../components/checkout";
import { usePaymentMethods } from "../../lib/usePaymentMethods";
import wooRestApi from "../../lib/woo_rest_api/rest_api";

import { useAuth } from "../../lib/useAuth";
import { useAccountController } from "../../lib/AccountController";

const Checkout = () => {
  const router = useRouter();
  const { data: homeData, loading: newProductsLoading } = useHomeData();
  const { selectedPayment, selectedShipping, getShippingMethods, cartInitialized } = useRestCart();
  const cart = useRestCart((state) => state.cart);
  const [submitting, setSubmitting] = useState(false);

  // 🔽 АВТОРИЗАЦИЯ + ПРОФИЛЬ 
  const { token } = useAuth();
  const {
    profileData,
    profileLoading,
  } = useAccountController(token);

  // Payment and Shipping Data
  const paymentMethods = usePaymentMethods();
  const shippingMethods = getShippingMethods();
  const selectedPaymentMethod = paymentMethods.methods.find((method) => method.id === selectedPayment);
  const selectedShippingMethod = shippingMethods.find((method) => method.id === selectedShipping);

  // Computed Values & State
  const isPickup = useMemo(() => selectedShipping?.includes("pickup") || false, [selectedShipping]);
  const isLoading = useMemo(() => newProductsLoading || !cartInitialized);
  const [cdekSelectedPoint, setCdekSelectedPoint] = useState(null);

  // 🔽 ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ initialValues ИЗ ПРОФИЛЯ
  const formInitialValues = {
    name: profileData?.firstName || "",
    surname: profileData?.lastName || "",
    email: profileData?.email || "",
    phone: profileData?.billing?.phone || "",
    city: profileData?.shipping?.city || "",
    street: profileData?.shipping?.address1 || "",
    house: profileData?.shipping?.address2 || "",
    country: profileData?.shipping?.country || "RU",
    state: profileData?.shipping?.state || "",
    postcode: profileData?.shipping?.postcode || "",
    comments: "",
  };

  //Methods
  const handleSubmitForm = async (values) => {
    if (submitting) return;          // защита от двойных кликов
    setSubmitting(true);

    try {
      const billingAddress = {
        first_name: values.name.split(" ")[0] || "",
        last_name: values.surname.split(" ")[0] || "",
        company: "",
        address_1: isPickup ? "САМОВЫВОЗ" : `${values.street} ${values.house}`,
        address_2: "",
        city: values.city || "Москва",
        state: values.state || "Москва",
        postcode: isPickup ? "119991" : values.postcode,
        country: "RU",
        email: values.email || "",
        phone: values.phone || "",
      };

      const checkoutData = {
        billing_address: { ...billingAddress },
        shipping_address: { ...billingAddress },
        customer_note: values.comments || "",
        payment_method: selectedPayment || "",
        payment_data: [],
        shipping_lines: [],
        extensions: {},
      };

      if (selectedShippingMethod?.method === "official_cdek") {
        checkoutData.shipping_lines.push({
          method_id: selectedShippingMethod.id,
          method_title: selectedShippingMethod.title,
        });
        if (cdekSelectedPoint) {
          checkoutData.extensions.official_cdek = {
            office_code: cdekSelectedPoint?.code || "",
          };
        }
      }

      console.log("[Checkout Data]", checkoutData);

      const result = await wooRestApi.createOrder(checkoutData);
      console.log(result);
      const orderId = result.order_id;
      const redirectUrl = result.payment_result?.redirect_url;
      const orderKey = result.order_key;
      console.log('orderKey - ', orderKey);

      if (result.payment_method === "cod" || result.payment_method === "bacs") {
        router.push(`/checkout/order-success/${orderId}?order_key=${encodeURIComponent(orderKey)}`);
      }

      if (result.payment_method === "yookassa_epl") {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }
    } catch (error) {
      console.error("[Checkout Error]", error);
      // тут можно показать тост/alert
    } finally {
      setSubmitting(false);          // вернём кнопку в нормальное состояние
    }
  };

  const onCdekSelectedPVZ = (data) => {
    setCdekSelectedPoint(data);
  };

  /* 
  ==================================================
  RENDER SECTION
  ==================================================
  */
  if (isLoading) return <EmptyCheckoutState title="Загрузка..." />;
  if (cart.items.length === 0) return <EmptyCheckoutState title="Ваша корзина пуста" />;

  return (
    <section className="checkout">
      <div className="container checkout__container">
        <h1 className="checkout__header">Оформление заказа</h1>

        <CheckoutMethodsInfo paymentMethod={selectedPaymentMethod} shippingMethod={selectedShippingMethod} />

        <Formik initialValues={formInitialValues} enableReinitialize={true} onSubmit={handleSubmitForm}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <form className="checkout__form" onSubmit={handleSubmit}>
              <b>Ваши данные</b><br />
              <div className="checkout-form-group">
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  className="checkout__form-input"
                  placeholder="Имя"
                  required
                />
                <input
                  type="text"
                  name="surname"
                  value={values.surname}
                  onChange={handleChange}
                  className="checkout__form-input"
                  placeholder="Фамилия"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  className="checkout__form-input"
                  placeholder="Телефон"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className="checkout__form-input"
                  placeholder="Email"
                  required
                />
              </div>
              {selectedShipping.includes('cdek') && (
                <div className="ship-met">
                  <b>Адрес доставки</b>
                  <br /><br />
                  <input
                    type="text"
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="Область/Регион"
                  />
                  <input
                    type="text"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="Город"
                    required
                  />
                  <input
                    type="text"
                    name="street"
                    value={values.street}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="Улица"
                    required
                  />
                  <input
                    type="text"
                    name="house"
                    value={values.house}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="checkout__form-input"
                    placeholder="Дом"
                    required
                  />
                  <input
                    type="text"
                    name="postcode"
                    value={values.postcode}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="Почтовый индекс"
                    required
                  />
                </div>
              )}

              {isPickup && <CheckoutPickupNotice />}
              {selectedShipping.includes('cdek') && <CdekMap onPVZselect={onCdekSelectedPVZ} />}

              <br />
              <br />

              <button
                type="submit"
                className={`checkout__form-button-submit${submitting ? " checkout__form-button-submit--loading" : ""}`}
                disabled={submitting}
              >
                {submitting ? "Заказ оформляется..." : "Оформить заказ"}
              </button>
            </form>
          )}
        </Formik>

        <NewItems products={homeData.new_products} />
      </div>
    </section >
  );
};

export default Checkout;
