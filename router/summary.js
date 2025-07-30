const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getSummary } = require("../controller/summaryController");

// router.get("/", protect, getSummary);
router.get(
  "/",
  protect,
  (req, res, next) => {
    console.log("DEBUG: Request entered /api/summary route in router."); // ADD THIS LINE
    next(); // Pass control to the next middleware (getSummary)
  },
  getSummary
); // <-- getSummary is the next handler after our log
module.exports = router;
