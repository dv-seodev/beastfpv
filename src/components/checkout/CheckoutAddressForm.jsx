const CheckoutAddressForm = ({ formData, onChange }) => (
  <>
    <div className="checkout__wrapper">
      <p>Город</p>
      <input
        className="checkout__form-input"
        type="text"
        name="city"
        value={formData.city}
        onChange={onChange}
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
          onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
          />
        </div>
        <div className="checkout__wrapper">
          <p>Индекс</p>
          <input
            className="checkout__form-input"
            type="text"
            name="index"
            value={formData.index}
            onChange={onChange}
            required
          />
        </div>
      </div>
    </div>
  </>
);

export default CheckoutAddressForm;
