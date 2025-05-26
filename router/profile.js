const express = require("express");
const protect = require("../middleware/auth");
const router = express.Router();

const {
  updatePassword,
  updateUsername,
  deleteAccount,
} = require("../controller/profileController");

router.post("/password", protect, updatePassword);

router.post("/username", protect, updateUsername);

router.get("/delete", protect, deleteAccount);

module.exports = router;
