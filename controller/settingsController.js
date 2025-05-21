const express = require("express");

const User = require("../models/userModel");



// Update user settings
const currencyUpdate = async (req, res) => {
  try {
    const { currency } = req.body;

    // Update user with the new currency setting
    req.user.currency = currency;
    await req.user.save();

    res
      .status(200)
      .send({ message: "Currency updated successfully", currency });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Get user settings
const currencyGet = async (req, res) => {
  try {
    const { currency } = req.user;
    res.status(200).send({ currency: currency || "USD" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = { currencyGet, currencyUpdate };
