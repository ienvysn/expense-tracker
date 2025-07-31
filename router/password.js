const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const protect = require("../middleware/auth");
const { checkEmail } = require("../controller/passwordController");

router.get("/", protect, checkEmail);
module.exports = router;
