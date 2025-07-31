const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { checkEmail } = require("../controller/passwordController");

router.post("/", checkEmail);
module.exports = router;
