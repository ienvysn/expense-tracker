const express = require("express");
const protect = require("../middleware/auth");
const router = express.Router();

const {
  currencyGet,
  currencyUpdate,
} = require("../controller/currencyController");

router.get("/", protect, currencyGet);
router.post("/", protect, currencyUpdate);

module.exports = router;
