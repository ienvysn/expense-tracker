const Expense = require("../models/expenseModel");

const addExpense = async (req, res) => {
  try {
    const { Name, Amount, Category } = req.body;

    if (!Name || !Amount || !Category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let newExpense = await Expense.create({ Name, Amount, Category });
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", category } = req.query;
    const sortOrder = order === "asc" ? 1 : -1;
    const filter = {}; // if no category then it is empty

    if (category) {
      filter.Category = category;
    }
    const expenses = await Expense.find(filter).sort({ [sortBy]: sortOrder });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
