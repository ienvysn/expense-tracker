const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  deleteExpense,
} = require("../controller/expenseController");

// POST /api/expenses → add new expense
router.post("/", addExpense);
router.get("/", addExpense);
router.delete("/", deleteExpense);

module.exports = router;
