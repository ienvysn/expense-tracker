const mongodb = require("mongodb");
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
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
      enum: ["Food", "Clothing", "Grocery", "Misc"],
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
// C:\Users\ACER\mongodb\bin\mongod.exe --dbpath=C:\Users\ACER\mongodb-data
