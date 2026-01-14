const CheckoutSubmitSection = ({ isSubmitting }) => (
  <>
    <div className="checkout__checkbox-wrapper">
      <input type="checkbox" className="checkout__form-checkbox" defaultChecked required />
      <span>Я даю свое согласие на обработку своих персональных данных</span>
    </div>

    <button type="submit" className="checkout__form-button-submit" disabled={isSubmitting}>
      {isSubmitting ? "Обработка..." : "Перейти к оплате"}
    </button>
  </>
);

export default CheckoutSubmitSection;
