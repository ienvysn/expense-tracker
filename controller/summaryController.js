const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const getSummary = async (req, res) => {
  try {
    const totalIncome = await Income.aggregate([
      {
        $group: {
          _id: null,
          sum: { $sum: "$Amount" },
        },
      },
    ]);
    const totalExpense = await Expense.aggregate([
      {
        $group: {
          _id: null,
          sum: { $sum: "$Amount" },
        },
      },
    ]);

    const user = await User.findById(req.user.userId);
    const totalbalance = user.balance;

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
