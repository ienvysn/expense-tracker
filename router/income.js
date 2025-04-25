const express = require("express");
const protect = require("../middleware/auth");
const router = express.Router();

const {
  addIncome,
  getIncome,
  summaryIncome,
  deleteIncome,
} = require("../controller/incomeController");

// POST /api/income → add new income
router.post("/", protect, addIncome);
router.get("/", protect, getIncome);
router.get("/summary", protect, summaryIncome);
router.delete("/:id", protect, deleteIncome);

module.exports = router;
