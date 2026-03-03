const CheckoutSubmitSection = ({ isSubmitting }) => (
  <>
    <div className="checkout__checkbox-wrapper">
      <input type="checkbox" className="checkout__form-checkbox" defaultChecked required />
      <span>Я даю свое согласие на <Link href="/soglasie-obrabotka-pers-dannyh.pdf" target="_blank" style={{ textDecoration: "underline" }}>обработку своих персональных данных</Link></span>
    </div>

    <button type="submit" className="checkout__form-button-submit" disabled={isSubmitting}>
      {isSubmitting ? "Обработка..." : "Перейти к оплате"}
    </button>
  </>
);

export default CheckoutSubmitSection;
