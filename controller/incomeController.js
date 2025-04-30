const Income = require("../models/incomeModel");
const User = require("../models/userModel");
const addIncome = async (req, res) => {
  try {
    const { Amount, Category, Description } = req.body;
    if (!Amount || !Category) {
      return res.status(400).json({ error: "All fields are required" });
    }
    let newIncome = await Income.create({
      Amount,
      Category,
      Description,
      user: req.user.userId,
    });
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { balance: Amount },
    });
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getIncome = async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc", category } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;
    const filter = {};

    if (category) {
      filter.Category = category;
    }

    const incomes = await Income.find({
      user: req.user.userId,
      ...filter,
    }).sort({ [sortBy]: sortOrder });

    res.status(200).json(incomes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Income" });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const deleted = await Income.findByIdAndDelete({
      user: req.user.userId,
      _id: id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Income not found" });
    }
    res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Income to delete Income" });
  }
};

module.exports = { addIncome, getIncome, deleteIncome };
