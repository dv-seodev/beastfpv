import Link from "next/link";

const CheckoutMethodsInfo = ({ paymentMethod, shippingMethod }) => {
  return (
    <div className="checkout__methods-wrapper">
      <div className="checkout__method">
        <p className="checkout__method-label">Выбранный способ оплаты:</p>
        <p className="checkout__method-value">
          <b>{paymentMethod?.title || "Не выбран"}</b>
        </p>
      </div>
      <div className="checkout__method">
        <p className="checkout__method-label">Выбранный способ доставки:</p>
        <p className="checkout__method-value">
          <b>{shippingMethod?.title || "Не выбран"}</b>
        </p>
      </div>
      <div>
        <Link href="/cart/" className="checkout__change-link continue-buy">
          <b>Вернуться в корзину</b>
        </Link>
      </div>
    </div>
  );
};

export default CheckoutMethodsInfo;
