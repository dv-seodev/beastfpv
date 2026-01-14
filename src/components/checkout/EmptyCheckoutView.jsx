const EmptyCheckoutState = ({ title, children }) => (
  <section className="checkout">
    <div className="container checkout__container">
      <h1 className="checkout__header">Оформление заказа</h1>
      <div className="checkout__empty">
        {title && <p>{title}</p>}
        {children}
      </div>
    </div>
  </section>
);

export default EmptyCheckoutState;
