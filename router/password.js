const express = require("express");
const router = express.Router();
const { resetLimiter } = require("../middleware/emailLimiter");

const {
  checkEmail,
  comapareToken,
  updatePassword,
} = require("../controller/passwordController");

router.post("/", checkEmail);
router.get("/:token", comapareToken);
router.post("/update-password", resetLimiter, updatePassword);
module.exports = router;
