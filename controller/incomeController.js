const Income = require("../models/incomeModel");

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
      user: req.user.userID,
    });
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = { addIncome };
