const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getIncomeVsExpense } = require("../controller/chartController");

router.get("/stats", protect, getIncomeVsExpense);

module.exports = router;
