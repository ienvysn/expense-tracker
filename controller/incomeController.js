const Income = require("../models/incomeModel");
const User = require("../models/userModel");
const addIncome = async (req, res) => {
  try {
    const { Name, Amount, Category, Description } = req.body;
    if (!Name || !Amount || !Category) {
      return res.status(400).json({ error: "All fields are required" });
    }
    let newIncome = await Income.create({
      Name,
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

const summaryIncome = async (req, res) => {
  try {
    const total = await Income.aggregate([
      {
        $group: {
          _id: null,
          sum: { $sum: "$Amount" },
        },
      },
    ]);

    //group by month and days
    const result = await Income.aggregate([
      {
        $match: {
          user: req.user.userId, // Filter by user first
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }, // Group by month (1–12)
            day: { $dayOfMonth: "$createdAt" }, // Group by day of the month (1–31)
          },
          total: { $sum: "$Amount" }, // Sum Incomne for each day
        },
      },
      {
        $group: {
          _id: "$_id.month", // Group again by month
          dailyTotals: {
            $push: { day: "$_id.day", total: "$total" },
          },
        },
      },
      {
        $project: {
          // cleans(hides) the unnecessary data/output
          _id: 0,
          month: "$_id",
          dailyTotals: 1,
        },
      },
    ]);

    let average = 0;
    result.forEach((month) => {
      const dailyTotals = month.dailyTotals;

      // If there are no daily totals, skip this month
      if (!dailyTotals || dailyTotals.length === 0) {
        console.log(`No daily totals for month ${month._id}`);
        return;
      }

      // Extract only the 'total' values from dailyTotals
      const dailyTotalValues = dailyTotals.map((entry) => entry.total);

      // Calculate sum and average
      const sum = dailyTotalValues.reduce((acc, value) => acc + value, 0);
      average = sum / dailyTotalValues.length;
      console.log("Average daily spending:", average);
    });

    const mostUsedCategory = await Income.aggregate([
      {
        $match: {
          user: req.user.userId, // Filter by user first
        },
      },
      { $group: { _id: "$Category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, // sorts from the most frequent category
      { $limit: 1 },
    ]);

    // If no category was found, set "N/A"
    const topCategory =
      mostUsedCategory.length > 0 ? mostUsedCategory[0]._id : "N/A";

    res.status(200).json({
      total: total[0]?.sum || 0,
      dailyAverage: average.toFixed(),
      topCategory: topCategory,
    });
  } catch (error) {
    console.error("Error occurred while fetching summary:", error);
    res.status(500).json({
      error:
        "An error occurred while fetching the summary. Please try again later.",
    });
  }
};
module.exports = { addIncome, getIncome, deleteIncome, summaryIncome };
