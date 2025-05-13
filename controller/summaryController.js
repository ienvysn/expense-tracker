const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
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
    console.log(totalIncome);

    //calculate Expense
    res.status(200).json({
      totalIncome: totalIncome[0]?.sum || 0,
      totalExpense: totalExpense[0]?.sum || 0,
      totalbalance: totalbalance || 0,
    });
  } catch (error) {
    console.error("Error occurred while fetching summary:", error);
    res.status(500).json({
      error:
        "An error occurred while fetching the summary. Please try again later.",
    });
  }
};

module.exports = { getSummary };
