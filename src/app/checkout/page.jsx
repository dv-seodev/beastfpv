"use client";
// export const dynamic = "force-dynamic";

import "./page.scss";
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useEffect, useMemo, useState } from "react";
import CdekMap from "./cdekmap";
import { useRestCart } from "../../lib/hooks/useRestCart";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "../../components/Loader";

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
  const isCdekShipping = useMemo(() => selectedShipping?.includes("cdek") || false, [selectedShipping]);
  const isBacsPayment = useMemo(() => selectedPayment === "bacs", [selectedPayment]);
  const shouldShowFullAddressFields = useMemo(
    () => isCdekShipping || isBacsPayment,
    [isCdekShipping, isBacsPayment]
  );
  const shouldUsePickupDefaults = useMemo(
    () => isPickup && !isBacsPayment,
    [isPickup, isBacsPayment]
  );
  const isLoading = useMemo(() => newProductsLoading || !cartInitialized);
  const [cdekSelectedPoint, setCdekSelectedPoint] = useState(null);
  const [cdekSelectionError, setCdekSelectionError] = useState("");
  const isCdekPointRequired = useMemo(() => isCdekShipping, [isCdekShipping]);

  useEffect(() => {
    setCdekSelectedPoint(null);
    setCdekSelectionError("");
  }, [selectedShipping]);

  // 🔽 ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ initialValues ИЗ ПРОФИЛЯ
  const formInitialValues = {
    name: profileData?.firstName || "",
    surname: profileData?.lastName || "",
    email: profileData?.email || "",
    phone: profileData?.billing?.phone || "",
    billing_company: profileData?.billing?.company || "",
    billing_inn: "",
    billing_kpp: "",
    city: profileData?.shipping?.city || "",
    street: profileData?.shipping?.address1 || "",
    house: profileData?.shipping?.address2 || "",
    country: profileData?.shipping?.country || "RU",
    state: profileData?.shipping?.state || "",
    postcode: profileData?.shipping?.postcode || "",
    comments: "",
    agree: false,
  };

  //Methods
  const handleSubmitForm = async (values) => {
    if (submitting) return;          // защита от двойных кликов
    if (!values.agree) return;
    if (isCdekPointRequired && !cdekSelectedPoint?.code) {
      setCdekSelectionError("Выберите пункт выдачи СДЭК, чтобы оформить заказ.");
      return;
    }
    setSubmitting(true);

    try {
      const billingAddress = {
        first_name: values.name.split(" ")[0] || "",
        last_name: values.surname.split(" ")[0] || "",
        company: isBacsPayment ? (values.billing_company || "") : "",
        address_1: shouldUsePickupDefaults ? "САМОВЫВОЗ" : `${values.street} ${values.house}`,
        address_2: "",
        city: values.city || "Москва",
        state: values.state || "Москва",
        postcode: shouldUsePickupDefaults ? "119991" : values.postcode,
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

      if (isBacsPayment) {
        checkoutData.billing_company = values.billing_company || "";
        checkoutData.billing_inn = values.billing_inn || "";
        checkoutData.billing_kpp = values.billing_kpp || "";
      }

      if (selectedShippingMethod?.method === "official_cdek") {
        checkoutData.shipping_lines.push({
          method_id: selectedShippingMethod.id,
          method_title: selectedShippingMethod.title,
        });
        if (cdekSelectedPoint?.code) {
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
    setCdekSelectionError("");
  };

  /* 
  ==================================================
  RENDER SECTION
  ==================================================
  */
  if (isLoading) return (
    <EmptyCheckoutState>
      <Loader label="Загружаем" />
    </EmptyCheckoutState>
  );;
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
              {shouldShowFullAddressFields && (
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

              {isBacsPayment && (
                <div className="ship-met">
                  <b>Юр. данные</b>
                  <br /><br />
                  <input
                    type="text"
                    name="billing_company"
                    value={values.billing_company || ""}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="Название компании"
                  />
                  <input
                    type="text"
                    name="billing_inn"
                    value={values.billing_inn || ""}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="ИНН"
                    required={isBacsPayment}
                  />
                  <input
                    type="text"
                    name="billing_kpp"
                    value={values.billing_kpp || ""}
                    onChange={handleChange}
                    className="checkout__form-input"
                    placeholder="КПП"
                    required={isBacsPayment}
                  />
                </div>
              )}
              <br />
              {isPickup && <CheckoutPickupNotice />}
              {isCdekShipping && <CdekMap onPVZselect={onCdekSelectedPVZ} />}
              {isCdekShipping && cdekSelectedPoint?.code && (
                <p style={{ color: "#1f7a1f", marginTop: "12px" }}>
                  Выбран ПВЗ: {cdekSelectedPoint?.code}
                </p>
              )}
              {isCdekShipping && cdekSelectionError && (
                <p style={{ color: "#d93025", marginTop: "12px" }}>
                  {cdekSelectionError}
                </p>
              )}



              <br />
              <br />

              <div className="checkout__checkbox-wrapper">
                <input
                  type="checkbox"
                  className="checkout__form-checkbox"
                  name="agree"
                  checked={Boolean(values.agree)}
                  onChange={handleChange}
                  required
                />
                <span>
                  Я даю свое согласие на{" "}
                  <Link href="/soglasie-obrabotka-pers-dannyh.pdf" target="_blank" style={{ textDecoration: "underline" }}>
                    обработку своих персональных данных
                  </Link>
                </span>
              </div>

              <button
                type="submit"
                className={`checkout__form-button-submit${submitting ? " checkout__form-button-submit--loading" : ""}`}
                disabled={submitting || !Boolean(values.agree) || (isCdekPointRequired && !cdekSelectedPoint?.code)}
                style={
                  submitting || !Boolean(values.agree) || (isCdekPointRequired && !cdekSelectedPoint?.code)
                    ? { opacity: 0.6, cursor: "not-allowed" }
                    : undefined
                }
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
