const Income = require("../models/incomeModel");
const User = require("../models/userModel");
const { redisClient } = require("../redisClient");
const SUMMARY_CACHE_KEY_PREFIX = "userSummary:";
const addIncome = async (req, res) => {
  try {
    const { Amount, Category, Description, Date } = req.body;
    if (!Amount || !Category) {
      return res.status(400).json({ error: "All fields are required" });
    }
    let newIncome = await Income.create({
      Amount,
      Category,
      Description,
      Date,
      user: req.user.userId,
    });
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { balance: Amount },
    });
    const userId = req.user.userId;
    const cacheKeyToInvalidate = `${SUMMARY_CACHE_KEY_PREFIX}${userId}`;
    await redisClient.del(cacheKeyToInvalidate);
    console.log(`Cache INVALDATED: Summary for user ${userId} removed.`);
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

    // First find the income to get its amount before deletion
    const income = await Income.findOne({
      user: req.user.userId,
      _id: id,
    });

    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }

    // Store the amount to subtract from balance
    const amountToSubtract = income.Amount;
    await Income.findByIdAndDelete(id);

    // Update user balance (subtract the income amount)
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { balance: -amountToSubtract },
    });
    const userId = req.user.userId;

    const cacheKeyToInvalidate = `${SUMMARY_CACHE_KEY_PREFIX}${userId}`;
    await redisClient.del(cacheKeyToInvalidate);
    console.log(`Cache INVALDATED: Summary for user ${userId} removed.`);

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete income" });
  }
};

module.exports = { addIncome, getIncome, deleteIncome };
