const mongodb = require("mongodb");
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    Amount: {
      type: Number,
      required: true,
      trim: true,
      min: [0, "Income amount must be a positive number"],
    },
    Category: {
      type: String,
      enum: [
        "Food",
        "Transportation",
        "Health",
        "Entertainment",
        "Shopping",
        "Insurance",
        "Misc",
        "Personal",
      ],
      required: true,
      trim: true,
    },
    Description: {
      type: String,
      trim: true,
      request: true,
    },
    Date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // This links the expense to a user
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);
module.exports = Expense;
// C:\Users\ACER\mongodb\bin\mongod.exe --dbpath=C:\Users\ACER\mongodb-data
