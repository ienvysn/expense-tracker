const express = require("express");
const protect = require("../middleware/auth");
const router = express.Router();

const {
  currencyGet,
  currencyUpdate,
} = require("../controller/settingsController");

router.get("/", protect, currencyGet);
router.put("/", protect, currencyUpdate);

module.exports = router;
