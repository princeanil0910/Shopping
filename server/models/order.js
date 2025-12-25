const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    userId: { type: String, default: null },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Pending" }, // Pending, Processing, Shipped, Delivered
    trackingNumber: { type: String, default: "" },
    carrier: { type: String, default: "" }, // Shipping carrier name
    estimatedDelivery: { type: Date, default: null },
    adminNotes: { type: String, default: "" }, // Internal notes visible to admin only
    customerNotes: { type: String, default: "" }, // Notes visible to customer
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

