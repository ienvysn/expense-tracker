const mongodb = require("mongodb");
const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Amount: {
      type: Number,
      required: true,
      trim: true,
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
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // This links the income to a user
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model("Income", incomeSchema);
module.exports = Income;
// C:\Users\ACER\mongodb\bin\mongod.exe --dbpath=C:\Users\ACER\mongodb-data
