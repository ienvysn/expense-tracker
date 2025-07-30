const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { redisClient } = require("../redisClient");
const SUMMARY_CACHE_KEY_PREFIX = "userSummary:"; // Identify which cache
const SUMMARY_TTL = 60 * 5; // Cache for 5 minutes (in seconds).
const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`DEBUG: userId received in getSummary: ${userId}`);
    const cacheKey = `${SUMMARY_CACHE_KEY_PREFIX}${userId}`; // ci just added cachinghache of a a particular userID
    const cachedSummary = await redisClient.get(cacheKey); //check for cache

    if (cachedSummary) {
      console.log(`Cache HIT for summary: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedSummary));
    }

    console.log(`Cache MISS for summary: ${cacheKey}. Fetching from DB...`);
    const totalIncome = await Income.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          sum: { $sum: "$Amount" },
        },
      },
    ]);
    const totalExpense = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          sum: { $sum: "$Amount" },
        },
      },
    ]);

    const user = await User.findById(req.user.userId);
    const totalbalance = user.balance;
    const summaryData = {
      totalIncome: totalIncome[0]?.sum || 0,
      totalExpense: totalExpense[0]?.sum || 0,
      totalbalance: totalbalance || 0,
    };

    await redisClient.setEx(cacheKey, SUMMARY_TTL, JSON.stringify(summaryData));
    console.log(`Summary data cached for ${cacheKey} with TTL ${SUMMARY_TTL}s`);

    res.status(200).json(summaryData);
  } catch (error) {
    console.error("Error occurred while fetching summary:", error);
    res.status(500).json({
      error:
        "An error occurred while fetching the summary. Please try again later.",
    });
  }
};

module.exports = { getSummary };
