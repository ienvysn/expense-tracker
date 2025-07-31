const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getSummary } = require("../controller/summaryController");

// router.get("/", protect, getSummary);
router.get(
  "/",
  protect,
  (req, res, next) => {
    next();
  },
  getSummary
);
module.exports = router;
