import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem("userOrders") || "{}");
      const list = all[user?.id] || [];
      setOrders(list.sort((a,b)=> b.orderId - a.orderId));
    } catch {
      setOrders([]);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow">
          <p className="mb-4">Please sign in to view your orders.</p>
          <Link to="/login" className="px-5 py-2 bg-blue-600 text-white rounded-lg">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.orderId} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{order.orderId}</p>
                  <p className="text-sm text-gray-600">Items: {order.items.reduce((a,i)=>a+i.quantity,0)} • Total: ₹{order.totalAmount}</p>
                </div>
                <Link to={`/track/${order.orderId}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Track</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}



