const express = require("express");
const Expense = require("../models/userModel");
const protect = require("../middleware/auth");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  deleteExpense,
  summaryExpense,
} = require("../controller/expenseController");

// POST /api/expenses → add new expense
router.post("/", protect, addExpense);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);
router.get("/summary", protect, summaryExpense);

module.exports = router;
