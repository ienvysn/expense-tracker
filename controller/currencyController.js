const express = require("express");

const User = require("../models/userModel");

// Middleware to authenticate user

// Update user settings
const currencyUpdate = async (req, res) => {
  try {
    const { currency } = req.body;
    
    if (!currency) {
      return res.status(400).json({ error: "Currency is required" });
    }

    // Update user with the new currency setting
    const user = await User.findById(req.user._id);
    user.currency = currency;
    await user.save();

    res.status(200).json({ message: "Currency updated successfully", currency });
  } catch (error) {
    console.error("Currency update error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get user settings
const currencyGet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ currency: user.currency || "USD" });
  } catch (error) {
    console.error("Currency get error:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { currencyGet, currencyUpdate };
