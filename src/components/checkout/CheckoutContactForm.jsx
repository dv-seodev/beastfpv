const CheckoutContactForm = ({ formData, onChange, isUserLoggedIn }) => (
  <div className="checkout__name-phone">
    <div className="checkout__wrapper">
      <p>ФИО</p>
      <input
        className="checkout__form-input"
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
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
        onChange={onChange}
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
        onChange={onChange}
        required={!isUserLoggedIn}
      />
    </div>
  </div>
);

export default CheckoutContactForm;
