import { formatPriceForDisplay } from "../../lib/utils/price";

const CheckoutPriceBreakdown = ({ baseTotal, discountTotal, shippingCost, finalTotal, isPickup }) => (
  <>
    <div className="checkout__price-breakdown">
      <div className="checkout__price-item">
        <span><b>Подитог: </b></span>
        <span>{formatPriceForDisplay(baseTotal)}</span>
      </div>

      {discountTotal > 0 && (
        <div className="checkout__price-item discount">
          <span><b>Скидка: </b></span>
          <span>-{formatPriceForDisplay(discountTotal)}</span>
        </div>
      )}

      {!isPickup && shippingCost > 0 && (
        <div className="checkout__price-item">
          <span><b>Доставка: </b></span>
          <span>{formatPriceForDisplay(shippingCost)}</span>
        </div>
      )}

      {isPickup && (
        <div className="checkout__price-item">
          <span><b>Доставка: </b></span>
          <span>Бесплатно</span>
        </div>
      )}
    </div>

    <div className="checkout__price">
      Сумма заказа: <span>{formatPriceForDisplay(finalTotal)}</span>
    </div>
  </>
);

export default CheckoutPriceBreakdown;
