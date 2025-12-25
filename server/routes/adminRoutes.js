const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require("../models/order");
const mongoose = require("mongoose");

const router = express.Router();

// Admin credentials
const ADMIN_USERNAME = "Anil";
const ADMIN_PASSWORD = "Anil@0251";

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { admin: true, username: ADMIN_USERNAME },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "7d" }
      );
      return res.json({
        token,
        admin: { username: ADMIN_USERNAME },
      });
    } else {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    if (!decoded.admin) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get all orders (admin only)
router.get("/orders", verifyAdmin, async (req, res) => {
  try {
    console.log("Admin fetching all orders..."); // DEBUG LOG
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find().sort({ createdAt: -1 });
      console.log(`Found ${orders.length} orders`); // DEBUG LOG
      return res.json(orders);
    } else {
      console.warn("Database not connected during admin fetch"); // DEBUG LOG
      // Fallback to localStorage if MongoDB not connected
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    console.error("Error fetching orders:", err); // DEBUG LOG
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update order tracking details (admin only) - MUST come before /orders/:orderId routes
router.patch("/orders/:orderId/tracking", verifyAdmin, async (req, res) => {
  try {
    console.log("=== TRACKING UPDATE ROUTE HIT ===");
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Original URL:", req.originalUrl);
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    
    const { trackingNumber, carrier, estimatedDelivery, customerNotes } = req.body;
    const updateData = {};
    
    // Determine query based on ID format
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      query = { _id: req.params.orderId };
    } else {
      const id = parseInt(req.params.orderId);
      if (isNaN(id)) {
        console.log("Invalid orderId:", req.params.orderId);
        return res.status(400).json({ message: "Invalid order ID" });
      }
      query = { orderId: id };
    }
    
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || "";
    if (carrier !== undefined) updateData.carrier = carrier || "";
    if (estimatedDelivery !== undefined && estimatedDelivery !== null && estimatedDelivery !== "") {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    } else if (estimatedDelivery === null || estimatedDelivery === "") {
      updateData.estimatedDelivery = null;
    }
    if (customerNotes !== undefined) updateData.customerNotes = customerNotes || "";

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOneAndUpdate(
        query,
        updateData,
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json(order);
    } else {
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    console.error("Error updating tracking:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update order status (admin only)
router.patch("/orders/:orderId/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      query = { _id: req.params.orderId };
    } else {
      const id = parseInt(req.params.orderId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      query = { orderId: id };
    }
    
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOneAndUpdate(
        query,
        { status },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json(order);
    } else {
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    console.error("Error updating status:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update admin notes (admin only, not visible to customer)
router.patch("/orders/:orderId/notes", verifyAdmin, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      query = { _id: req.params.orderId };
    } else {
      const id = parseInt(req.params.orderId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      query = { orderId: id };
    }
    
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOneAndUpdate(
        query,
        { adminNotes: adminNotes || "" },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.json(order);
    } else {
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    console.error("Error updating admin notes:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get order by ID (admin only) - MUST come after all specific routes
router.get("/orders/:orderId", verifyAdmin, async (req, res) => {
  try {
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      query = { _id: req.params.orderId };
    } else {
      const id = parseInt(req.params.orderId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      query = { orderId: id };
    }
    
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne(query);
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

router.delete("/orders/:orderId", verifyAdmin, async (req, res) => {
  try {
    let query;
    if (mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      query = { _id: req.params.orderId };
    } else {
      const id = parseInt(req.params.orderId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      query = { orderId: id };
    }

    if (mongoose.connection.readyState === 1) {
      const result = await Order.deleteOne(query);
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(204).send();
    } else {
      return res.status(503).json({ message: "Database not connected" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Debug route to test if admin routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are working", timestamp: new Date().toISOString() });
});

// Catch-all for debugging unmatched routes
router.use((req, res, next) => {
  console.log(`[ADMIN ROUTES] Unmatched route: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "Route not found", 
    method: req.method, 
    path: req.path,
    availableRoutes: [
      "GET /api/admin/orders",
      "GET /api/admin/orders/:orderId",
      "PATCH /api/admin/orders/:orderId/status",
      "PATCH /api/admin/orders/:orderId/tracking",
      "PATCH /api/admin/orders/:orderId/notes",
      "DELETE /api/admin/orders/:orderId"
    ]
  });
});

module.exports = router;

