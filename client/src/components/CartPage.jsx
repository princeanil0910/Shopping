import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-700">
        <h2 className="text-2xl font-bold mb-3">🛒 Your cart is empty!</h2>
        <Link
          to="/"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-2xl mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">🛍️ Your Cart</h2>

      <ul className="space-y-4">
        {cartItems.map((item) => (
          <li
            key={item._id}
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm"
          >
            <div>
              <p className="text-lg font-semibold">{item.name}</p>
              <p className="text-gray-600">₹{item.price}</p>
            </div>
            <button
              onClick={() => removeFromCart(item._id)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ❌ Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-between items-center border-t pt-4">
        <h3 className="text-xl font-bold">Total: ₹{total}</h3>

        <div className="flex gap-4">
          <button
            onClick={clearCart}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105"
          >
            Clear Cart
          </button>

          <Link
            to="/checkout"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
