const express = require("express");
const router = express.Router();
const { register, login } = require("../controller/authController");

router.post("/register", register);
router.get("/login", login);
module.exports = router;
