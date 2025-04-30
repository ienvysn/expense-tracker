const { request } = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    Amount: {
      type: Number,
      required: true,
      trim: true,
      min: [0, "Income amount must be a positive number"],
    },
    Category: {
      type: String,
      enum: ["Salary", "Business", "Gifts", "Interest", "Allowance", "Other"],
      required: true,
      trim: true,
    },
    Description: {
      type: String,
      trim: true,
      request: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // This links the income to a user
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model("Income", incomeSchema);
module.exports = Income;
// C:\Users\ACER\mongodb\bin\mongod.exe --dbpath=C:\Users\ACER\mongodb-data
