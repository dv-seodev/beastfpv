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
import { parsePrice } from "../../lib/utils/price";
import { transformRestCartItems, handleCartError } from "../../lib/utils/cart";

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

const Checkout = () => {
  const router = useRouter();
  const { data, loading, error } = useHomeData();
  const { user } = useAuth();
  const restCart = useRestCart();
  const {
    cart,
    fetchCart,
    getShippingMethods,
    handleClearCart,
    loading: cartLoading,
    selectedPayment,
    selectedShipping,
  } = restCart;

  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [isHydrated, user]);

  const items = cart?.items || [];
  const totals = cart?.totals || {};
  const coupons = cart?.coupons || [];
  const cartItems = useMemo(() => transformRestCartItems(items), [items]);
  const shippingMethods = getShippingMethods();

  const baseTotal = useMemo(() => (totals?.total_items ? parsePrice(totals.total_items) : 0), [totals?.total_items]);
  const discountTotal = useMemo(
    () => (coupons?.[0]?.totals?.total_discount ? parsePrice(coupons[0].totals.total_discount) : 0),
    [coupons]
  );

  const selectedShippingMethod = selectedShipping;
  const selectedPaymentMethod = selectedPayment;
  const shippingCost = selectedShippingMethod?.price || 0;
  const finalTotal = totals?.total_price ? parsePrice(totals.total_price) : baseTotal - discountTotal + shippingCost;
  const isPickup = selectedShippingMethod?.method?.includes("pickup") || false;
  const isLoading = useMemo(() => loading || cartLoading || !isHydrated, [loading, cartLoading, isHydrated]);

  const handlePVZSelect = useCallback((pvzData) => setCDEKOfficeID(pvzData.code), []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const nextValue = name === "phone" ? formatPhoneNumber(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formData.phone.length < 18) {
        alert("Пожалуйста, введите полный номер телефона");
        return;
      }

      if (!isPickup && (!formData.city || !formData.street || !formData.house || !formData.index)) {
        alert("Пожалуйста, заполните все поля адреса");
        return;
      }

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
            city: formData.city,
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
          shipping_lines: [],
          extensions: { official_cdek: { office_code: selectedCDEKOfficeID } },
        };

        const result = await wooRestApi.createOrder(orderData);
        console.log("[CHECKOUT =====>] result", result);

        return;

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
    [cartItems, formData, handleClearCart, isPickup, router, selectedCDEKOfficeID, selectedPayment]
  );

  if (isLoading) return <EmptyCheckoutState title="Загрузка..." />;
  if (error) return <EmptyCheckoutState title={`❌ Ошибка: ${error?.message || "Неизвестная ошибка"}`} />;
  if (!data) return <EmptyCheckoutState title="Нет данных" />;

  const { new_products } = data;

  if (isHydrated && cartItems.length === 0) {
    return (
      <section className="checkout">
        <div className="container checkout__container">
          <h3 className="checkout__header">Ваша корзина пуста</h3>
          <Link className="continue-buy" href="/cart/">Продолжить покупки</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout">
      <div className="container checkout__container">
        <h1 className="checkout__header">Оформление заказа</h1>

        <CheckoutMethodsInfo paymentMethod={selectedPaymentMethod} shippingMethod={selectedShippingMethod} />

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

        <NewItems products={new_products} />
      </div>
    </section>
  );
};

export default Checkout;
