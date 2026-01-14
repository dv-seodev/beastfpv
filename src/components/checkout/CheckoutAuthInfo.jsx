const CheckoutAuthInfo = ({ user }) => {
  if (!user) return null;
  
  return (
    <div
      className="checkout__auth-info"
      style={{
        padding: "10px 15px",
        backgroundColor: "#e8f5e9",
        borderLeft: "4px solid #4caf50",
        marginBottom: "20px",
        borderRadius: "4px",
      }}
    >
      <p style={{ margin: 0, color: "#2e7d32", fontSize: "14px" }}>
        ✅ Вы авторизованы как <strong>{user.email}</strong>
      </p>
    </div>
  );
};

export default CheckoutAuthInfo;
