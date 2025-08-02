const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const mongoose = require("mongoose");

const getIncomeVsExpense = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const totalIncome = await Income.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$Amount" },
        },
      },
    ]);

    const totalExpense = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$Amount" },
        },
      },
    ]);

    // We can get the balance directly from the user object attached by our middleware
    const balance = req.user.balance;

    res.status(200).json({
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      balance: balance || 0, // Add balance to the response
    });
  } catch (error) {
    console.error("Error fetching income vs expense data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};

module.exports = { getIncomeVsExpense };
