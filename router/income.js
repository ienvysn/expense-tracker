const express = require("express");
const protect = require("../middleware/auth");
const router = express.Router();

const { addIncome } = require("../controller/incomeController");

// POST /api/income → add new income
router.post("/", protect, addIncome);

module.exports = router;
