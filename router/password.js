const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  checkEmail,
  comapareToken,
  updatePassword,
} = require("../controller/passwordController");

router.post("/", checkEmail);
router.get("/:token", comapareToken);
router.post("/update-password", updatePassword);
module.exports = router;
