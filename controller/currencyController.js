const express = require("express");

const User = require("../models/userModel");

const currencyUpdate = async (req, res) => {
  try {
    const newCurrency = req.body;
    curr = newCurrency.currency;

    await User.findByIdAndUpdate(req.user.userId, {
      currency: curr,
    });

    res.status(200).send({ message: "Currency updated successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const currencyGet = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).send({ currency: user.currency });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
module.exports = { currencyGet, currencyUpdate };
