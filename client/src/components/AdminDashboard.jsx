import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "",
    customerNotes: "",
    adminNotes: "",
  });
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const adminAuth = JSON.parse(localStorage.getItem("adminAuth") || "{}");
      const token = adminAuth.token;

      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminAuth");
        navigate("/admin-login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      navigate("/admin-login");
      return;
    }

    fetchOrders();
  }, [navigate, fetchOrders]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin-login");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminAuth = JSON.parse(localStorage.getItem("adminAuth") || "{}");
      const token = adminAuth.token;

      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders(); // Refresh orders
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      alert("Error updating order status");
    }
  };

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      trackingNumber: order.trackingNumber || (order.orderId ? String(order.orderId) : ""),
      carrier: order.carrier || "",
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString().split("T")[0]
        : "",
      customerNotes: order.customerNotes || "",
      adminNotes: order.adminNotes || "",
    });
    setShowTrackingModal(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const closeTrackingModal = () => {
    setSelectedOrder(null);
    setShowTrackingModal(false);
  };

  const closeDetailsModal = () => {
    setSelectedOrder(null);
    setShowDetailsModal(false);
  };

  const handleTrackingUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const adminAuth = JSON.parse(localStorage.getItem("adminAuth") || "{}");
      const token = adminAuth.token;

      const res = await fetch(`${API_URL}/api/admin/orders/${selectedOrder._id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(trackingForm),
      });

      if (res.ok) {
        fetchOrders();
        closeTrackingModal();
      } else {
        alert("Failed to update tracking info");
      }
    } catch (err) {
      alert("Error updating tracking info");
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm("Delete this order? This cannot be undone.");
    if (!confirmed) return;
    try {
      const adminAuth = JSON.parse(localStorage.getItem("adminAuth") || "{}");
      const token = adminAuth.token;
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminAuth");
        navigate("/admin-login");
        return;
      }
      if (res.ok || res.status === 204) {
        fetchOrders();
      } else {
        alert("Failed to delete order");
      }
    } catch (err) {
      alert("Error deleting order");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Order ID</th>
                  <th className="p-4 font-semibold text-gray-600">Customer</th>
                  <th className="p-4 font-semibold text-gray-600">Total</th>
                  <th className="p-4 font-semibold text-gray-600">Date</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-mono text-gray-500">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {order.customerName || order.user?.name || "Guest"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.email || order.user?.email || "No Email"}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className={`border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          order.status === "Delivered"
                            ? "text-green-600 bg-green-50 border-green-200"
                            : order.status === "Cancelled"
                            ? "text-red-600 bg-red-50 border-red-200"
                            : "text-blue-600 bg-blue-50 border-blue-200"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm underline text-left"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openTrackingModal(order)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm underline text-left"
                        >
                          Update Tracking
                        </button>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm underline text-left"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-800">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Customer Info</h3>
                <p className="text-gray-800"><span className="font-medium">Name:</span> {selectedOrder.customerName || selectedOrder.user?.name || "N/A"}</p>
                <p className="text-gray-800"><span className="font-medium">Email:</span> {selectedOrder.email || selectedOrder.user?.email || "N/A"}</p>
                <p className="text-gray-800"><span className="font-medium">Phone:</span> {selectedOrder.phone || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Shipping Address</h3>
                <p className="text-gray-800">{selectedOrder.address}</p>
                <p className="text-gray-800">{selectedOrder.city}, {selectedOrder.pincode}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-600 mb-2">Order Items</h3>
              <div className="bg-gray-50 rounded border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">${item.price?.toFixed(2)}</td>
                        <td className="p-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold border-t">
                    <tr>
                      <td colSpan="3" className="p-2 text-right">Total Amount:</td>
                      <td className="p-2 text-right">${selectedOrder.totalAmount?.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <h3 className="font-semibold text-gray-600 mb-2">Order Status</h3>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  selectedOrder.status === "Delivered" ? "bg-green-100 text-green-800" :
                  selectedOrder.status === "Cancelled" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {selectedOrder.status}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Ordered on: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
               </div>
               {selectedOrder.trackingNumber && (
                 <div>
                   <h3 className="font-semibold text-gray-600 mb-2">Tracking Info</h3>
                   <p className="text-sm">Carrier: {selectedOrder.carrier}</p>
                   <p className="text-sm">Tracking #: {selectedOrder.trackingNumber}</p>
                 </div>
               )}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={closeTrackingModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Update Tracking Info</h2>
            {selectedOrder && (
              <div className="mb-4 text-sm text-gray-600">
                Order ID: <span className="font-mono">{selectedOrder.orderId || selectedOrder._id}</span>
              </div>
            )}
            <form onSubmit={handleTrackingUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={trackingForm.carrier}
                  onChange={(e) =>
                    setTrackingForm({ ...trackingForm, carrier: e.target.value })
                  }
                  placeholder="e.g. UPS, FedEx, DHL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={trackingForm.trackingNumber}
                  onChange={(e) =>
                    setTrackingForm({
                      ...trackingForm,
                      trackingNumber: e.target.value,
                    })
                  }
                  placeholder="Tracking #"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery
                </label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={trackingForm.estimatedDelivery}
                  onChange={(e) =>
                    setTrackingForm({
                      ...trackingForm,
                      estimatedDelivery: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Internal)
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows="2"
                  value={trackingForm.adminNotes}
                  onChange={(e) =>
                    setTrackingForm({
                      ...trackingForm,
                      adminNotes: e.target.value,
                    })
                  }
                  placeholder="Notes visible only to admins"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Notes
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  rows="2"
                  value={trackingForm.customerNotes}
                  onChange={(e) =>
                    setTrackingForm({
                      ...trackingForm,
                      customerNotes: e.target.value,
                    })
                  }
                  placeholder="Notes visible to customer"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeTrackingModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
