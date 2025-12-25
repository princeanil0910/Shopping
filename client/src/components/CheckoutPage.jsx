import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const orderId = Math.floor(100000 + Math.random() * 900000); // random order id

    const orderData = {
      orderId,
      formData,
      items: cartItems,
      totalAmount,
      userId: user?.id || null,
    };

    navigate("/payment", { state: { orderDraft: orderData } });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Please sign in</h2>
        <p>Login to continue to checkout.</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <h2 className="text-3xl font-bold text-blue-600 mb-4">
          🛒 Your Cart is Empty
        </h2>
        <p>Looks like you haven’t added anything to your cart yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          🧾 Checkout
        </h1>

        {/* Cart Summary */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Your Items
          </h2>
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="flex justify-between py-2 border-b border-gray-100"
            >
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between mt-3 text-lg font-bold text-blue-700">
            <span>Total:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {/* Shipping Form */}
        <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <input type="text" name="name" placeholder="Full Name" required
            value={formData.name} onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400" />
          <input type="email" name="email" placeholder="Email" required
            value={formData.email} onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="address" placeholder="Address" required
            value={formData.address} onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 col-span-2" />
          <input type="text" name="city" placeholder="City" required
            value={formData.city} onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="pincode" placeholder="Pincode" required
            value={formData.pincode} onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="phone" placeholder="Phone" required
            value={formData.phone} onChange={handleChange}
            className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 col-span-2" />

          <button
            type="submit"
            className="col-span-2 mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            💳 Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
}
