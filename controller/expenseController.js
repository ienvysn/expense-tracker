const Expense = require("../models/expenseModel");
const User = require("../models/userModel");
const addExpense = async (req, res) => {
  try {
    const { Amount, Category, Description, Date } = req.body;

    if (!Amount || !Category) {
      return res.status(400).json({ error: "All fields are required" });
    }
    let newExpense = await Expense.create({
      Amount,
      Category,
      Description,
      Date,
      user: req.user.userId,
    });
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { balance: -Amount },
    });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
const getExpenses = async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", category } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;

    const filter = {};

    if (category) {
      filter.category = category;
    }
    const expenses = await Expense.find({
      user: req.user.userId,
      ...filter,
    }).sort({ [sortBy]: sortOrder });

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the expense to get its amount before deletion
    const expense = await Expense.findOne({
      user: req.user.userId,
      _id: id,
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Store the amount to refund to balance
    const amountToRefund = expense.Amount;

    await Expense.findByIdAndDelete(id);

    // Update user balance (add the expense amount back)
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { balance: amountToRefund },
    });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
