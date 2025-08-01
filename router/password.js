const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  checkEmail,
  comapareToken,
} = require("../controller/passwordController");

router.post("/", checkEmail);
router.get("/:token", comapareToken);
module.exports = router;
