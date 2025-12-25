const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("../models/user");
const fileStore = require("../utils/userStore");

const router = express.Router();

// Debug: show current storage mode
router.get("/debug", (req, res) => {
  const mode = mongoose.connection.readyState === 1 ? "mongo" : "file";
  return res.json({ mode });
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    // Use Mongo if connected, otherwise fallback to file store
    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "Email already registered" });
      const user = await User.create({ name, email, passwordHash });
      return res.status(201).json({ id: user._id, name: user.name, email: user.email });
    } else {
      const existing = fileStore.findByEmail(email);
      if (existing) return res.status(409).json({ message: "Email already registered" });
      const user = fileStore.createUser({ name, email, passwordHash });
      return res.status(201).json({ id: user.id, name: user.name, email: user.email });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });
      const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } else {
      const user = fileStore.findByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });
      const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const token = crypto.randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOneAndUpdate(
        { email },
        { resetToken: token, resetTokenExpires: expires },
        { new: true }
      );
    } else {
      user = fileStore.setResetToken(email, token, expires);
    }
    const resetUrl = `${req.protocol}://${req.get("host").replace(/\/+$/,'')}/reset-password/${token}`;
    return res.json({ message: "If the email exists, a reset link is generated", resetUrl, token });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
    const passwordHash = await bcrypt.hash(password, 10);
    let user = null;
    if (mongoose.connection.readyState === 1) {
      const found = await User.findOne({ resetToken: token });
      if (!found) return res.status(400).json({ message: "Invalid token" });
      if (!found.resetTokenExpires || found.resetTokenExpires < new Date()) return res.status(400).json({ message: "Token expired" });
      found.passwordHash = passwordHash;
      found.resetToken = null;
      found.resetTokenExpires = null;
      await found.save();
      user = found;
    } else {
      const found = fileStore.findByResetToken(token);
      if (!found) return res.status(400).json({ message: "Invalid token" });
      if (!found.resetTokenExpires || new Date(found.resetTokenExpires) < new Date()) return res.status(400).json({ message: "Token expired" });
      user = fileStore.updatePasswordByResetToken(token, passwordHash);
    }
    return res.json({ message: "Password reset successful" });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
