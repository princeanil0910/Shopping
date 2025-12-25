import React from "react";
import { Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderSummary() {
  const location = useLocation();
  const { orderData } = location.state || {};

  if (!orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          ⚠️ No Order Found
        </h2>
        <p className="text-gray-700 mb-6">
          It seems you haven't placed an order yet.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl mt-10 p-8">
      <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
        ✅ Order Confirmed!
      </h1>

      <div className="text-center mb-8">
        <p className="text-lg text-gray-700">
          Thank you for shopping with <strong>ShopNow</strong>!
        </p>
        <p className="text-gray-500 mt-2">
          Your order ID:{" "}
          <span className="font-mono bg-gray-100 px-3 py-1 rounded">
            #{orderData.orderId}
          </span>
        </p>
      </div>

      {/* Delivery Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-2xl font-semibold text-blue-700 mb-3">
          🚚 Delivery Details
        </h2>
        <p><strong>Name:</strong> {orderData.formData.name}</p>
        <p><strong>Email:</strong> {orderData.formData.email}</p>
        <p><strong>Address:</strong> {orderData.formData.address}</p>
        <p><strong>City:</strong> {orderData.formData.city}</p>
        <p><strong>Pincode:</strong> {orderData.formData.pincode}</p>
        <p><strong>Phone:</strong> {orderData.formData.phone}</p>
      </div>

      {/* Ordered Items */}
      <div>
        <h2 className="text-2xl font-semibold text-blue-700 mb-3">
          🛍️ Ordered Items
        </h2>
        <ul className="divide-y divide-gray-200 mb-6">
          {orderData.items.map((item, idx) => (
            <li key={idx} className="flex justify-between py-3">
              <span>{item.name}</span>
              <span className="font-semibold">₹{item.price}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total Amount:</span>
          <span className="text-green-700">₹{orderData.totalAmount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        <button
          onClick={() => {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("ShopNow - Order Summary", 14, 18);
            doc.setFontSize(12);
            doc.text(`Tracking ID: #${orderData.orderId}`, 14, 26);
            doc.text(`Name: ${orderData.formData.name}`, 14, 34);
            doc.text(
              `Address: ${orderData.formData.address}, ${orderData.formData.city} - ${orderData.formData.pincode}`,
              14,
              42
            );
            doc.text(`Phone: ${orderData.formData.phone}`, 14, 50);

            const tableBody = orderData.items.map((item) => [
              item.name,
              String(item.quantity),
              `₹${item.price}`,
              `₹${item.price * item.quantity}`,
            ]);

            autoTable(doc, {
              startY: 58,
              head: [["Item", "Qty", "Price", "Subtotal"]],
              body: tableBody,
            });

            const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 70;
            doc.setFontSize(14);
            doc.text(`Total: ₹${orderData.totalAmount}`, 14, finalY + 10);
            doc.save(`ShopNow_Order_${orderData.orderId}.pdf`);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-transform transform hover:scale-105"
        >
          Download PDF
        </button>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-transform transform hover:scale-105 text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
