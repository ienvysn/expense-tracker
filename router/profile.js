const express = require("express");
const protect = require("../middleware/auth");
const router = express.Router();

const {
  updatePassword,
  updateUsername,
} = require("../controller/profileController");

router.post("/password", protect, updatePassword);

router.post("/username", protect, updateUsername);

module.exports = router;
