const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  deleteExpense,
  summaryExpense,
} = require("../controller/expenseController");

// POST /api/expenses → add new expense
router.post("/", addExpense);
router.get("/", getExpenses);
router.delete("/:id", deleteExpense);
router.get("/summary", summaryExpense);

module.exports = router;
