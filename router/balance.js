const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const protect = require("../middleware/auth");
const { getBalance } = require("../controller/balanceController");

router.get("/", protect, getBalance);
module.exports = router;
