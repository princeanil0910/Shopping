const express = require("express");
const Order = require("../models/order");
const mongoose = require("mongoose");

const router = express.Router();

// Create a new order
router.post("/", async (req, res) => {
  try {
    console.log("Received new order request:", req.body); // DEBUG LOG
    const { orderId, userId, formData, items, totalAmount } = req.body;
    
    if (!orderId || !formData || !items || !totalAmount) {
      console.error("Missing required fields"); // DEBUG LOG
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (mongoose.connection.readyState === 1) {
      // Ensure orderId is a number
      const numericOrderId = typeof orderId === 'string' ? parseInt(orderId) : orderId;
      if (isNaN(numericOrderId)) {
        console.error("Invalid order ID format:", orderId); // DEBUG LOG
        return res.status(400).json({ message: "Invalid order ID format" });
      }
      
      const order = await Order.create({
        orderId: numericOrderId,
        userId: userId || null,
        customerName: formData.name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone,
        items,
        totalAmount,
        status: "Pending",
      });
      console.log("Order created successfully:", order); // DEBUG LOG
      return res.status(201).json(order);
    } else {
      console.warn("MongoDB not connected, cannot save order"); // DEBUG LOG
      // If MongoDB not connected, still return success (fallback to localStorage)
      return res.status(201).json({ message: "Order saved locally (MongoDB not connected)" });
    }
  } catch (err) {
    console.error("Error creating order:", err); // DEBUG LOG
    if (err.code === 11000) {
      return res.status(409).json({ message: "Order ID already exists" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get orders for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get order by ID
router.get("/:orderId", async (req, res) => {
  try {
    // Convert orderId to number for query
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json(order);
    } else {
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

