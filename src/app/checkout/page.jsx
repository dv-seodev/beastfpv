"use client";

import "./page.scss";
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import CdekMap from "./cdekmap";
import { useRestCart } from "../../lib/hooks/useRestCart";
import { Formik } from "formik";
import { useState } from "react";

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

const Checkout = () => {
  const { data: homeData, loading: newProductsLoading } = useHomeData();
  const { selectedPayment, selectedShipping, getShippingMethods, cartInitialized } = useRestCart();
  const cart = useRestCart((state) => state.cart);

  // Payment and Shipping Data
  const paymentMethods = usePaymentMethods();
  const shippingMethods = getShippingMethods();
  const selectedPaymentMethod = paymentMethods.methods.find((method) => method.id === selectedPayment);
  const selectedShippingMethod = shippingMethods.find((method) => method.id === selectedShipping);

  // Computed Values & State
  const isPickup = useMemo(() => selectedShipping?.includes("pickup") || false, [selectedShipping]);
  const isLoading = useMemo(() => newProductsLoading || !cartInitialized);
  const [cdekSelectedPoint, setCdekSelectedPoint] = useState(null);
  const formInitialValues = {
    name: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    house: "",
    country: "RU",
    state: "",
    postcode: "",
    comments: "",
  };

  //Methods
  const handleSubmitForm = (values) => {
    const billingAddress = {
      first_name: values.name.split(" ")[0] || "",
      last_name: values.name.split(" ")[1] || "",
      company: "",
      address_1: `${values.street} ${values.house}`,
      address_2: "",
      city: values.city || "",
      state: values.state || "",
      postcode: values.postcode || "",
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

    if (selectedShippingMethod?.method == "official_cdek") {
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

    // Checkout method
    console.log("[Checkout Data]", checkoutData);

    wooRestApi
      .createOrder(checkoutData)
      .then((result) => {
        console.log("[Checkout Result]", result);
      })
      .catch((error) => {
        console.error("[Checkout Error]", error);
      });
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

        <Formik initialValues={formInitialValues} onSubmit={handleSubmitForm}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <form className="checkout__form" onSubmit={handleSubmit}>
              <div className="checkout-form-group">
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Имя"
                />
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Телефон"
                />
                <input
                  type="text"
                  name="state"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Область/Регион"
                />
                <input
                  type="text"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Город"
                />
                <input
                  type="text"
                  name="street"
                  value={values.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Улица"
                />
                <input
                  type="text"
                  name="house"
                  value={values.house}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Дом"
                />
                <input
                  type="text"
                  name="postcode"
                  value={values.postcode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="checkout__form-input"
                  placeholder="Почтовый индекс"
                />
              </div>

              {isPickup && <CheckoutPickupNotice />}
              <button type="submit">Отправить</button>
            </form>
          )}
        </Formik>

        {!isPickup && <CdekMap onPVZselect={onCdekSelectedPVZ} />}

        {/* CheckoutForm 
        <form className="checkout__form" onSubmit={handleSubmit}>
          <CheckoutAuthInfo user={user} />
          <CheckoutContactForm formData={formData} onChange={handleInputChange} isUserLoggedIn={!!user} />

          {!isPickup && <CheckoutAddressForm formData={formData} onChange={handleInputChange} />}
          {isPickup && <CheckoutPickupNotice />}
          {!isPickup && <CdekMap onPVZselect={handlePVZSelect} />}

          <CheckoutPriceBreakdown
            baseTotal={baseTotal}
            discountTotal={discountTotal}
            shippingCost={shippingCost}
            finalTotal={finalTotal}
            isPickup={isPickup}
          />

          <CheckoutSubmitSection isSubmitting={isSubmitting} />
        </form>
        */}

        <NewItems products={homeData.new_products} />
      </div>
    </section>
  );
};

export default Checkout;
