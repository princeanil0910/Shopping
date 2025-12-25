import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_URL } from "../config";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { orderDraft } = location.state || {};
  const [method, setMethod] = useState("Card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!orderDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="mb-4">No order draft found.</p>
          <button
            onClick={() => navigate("/checkout")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  const confirmPayment = async () => {
    setProcessing(true);
    setError("");
    try {
      const payload = { ...orderDraft, paymentMethod: method };
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError("Failed to create order on server. Saving locally.");
      }
      const byId = JSON.parse(localStorage.getItem("orders") || "{}");
      byId[String(orderDraft.orderId)] = payload;
      localStorage.setItem("orders", JSON.stringify(byId));
      if (orderDraft.userId) {
        const userOrders = JSON.parse(localStorage.getItem("userOrders") || "{}");
        const list = userOrders[orderDraft.userId] || [];
        list.push(payload);
        userOrders[orderDraft.userId] = list;
        localStorage.setItem("userOrders", JSON.stringify(userOrders));
      }
      clearCart();
      navigate("/order-summary", { state: { orderData: payload } });
    } catch {
      setError("Unexpected error while processing payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Payment</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Order Summary</h2>
            <div className="bg-gray-50 rounded border p-4">
              {orderDraft.items.map((i, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                  <span>{i.name} × {i.quantity}</span>
                  <span>₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between mt-3 text-lg font-bold text-blue-700">
                <span>Total:</span>
                <span>₹{orderDraft.totalAmount}</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Shipping</h2>
            <div className="bg-gray-50 rounded border p-4 text-sm text-gray-700">
              <p><strong>Name:</strong> {orderDraft.formData.name}</p>
              <p><strong>Email:</strong> {orderDraft.formData.email}</p>
              <p><strong>Phone:</strong> {orderDraft.formData.phone}</p>
              <p><strong>Address:</strong> {orderDraft.formData.address}, {orderDraft.formData.city} - {orderDraft.formData.pincode}</p>
              <p className="mt-2"><strong>Order ID:</strong> #{orderDraft.orderId}</p>
            </div>
          </div>
        </div>

        <h2 className="font-semibold text-gray-700 mb-3">Payment Method</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Card", "UPI", "Wallet", "COD"].map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-4 py-2 rounded border ${method === m ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}
            >
              {m}
            </button>
          ))}
        </div>

        {error && <div className="mt-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => navigate("/checkout")}
            className="px-5 py-3 bg-gray-200 rounded hover:bg-gray-300"
            disabled={processing}
          >
            Back
          </button>
          <button
            onClick={confirmPayment}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:opacity-60"
            disabled={processing}
          >
            {processing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

