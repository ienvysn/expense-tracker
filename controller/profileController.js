const User = require("../models/userModel");
const Income = require("../models/incomeModel");
const Expense = require("../models/expenseModel");

const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    req.user.password = password;
    console.log(req.user.password);
    await req.user.save();
    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    req.user.username = username;
    await req.user.save();
    res.status(200).send({ message: "Username updated successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Expense.deleteMany({ user: userId });
    await Income.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.status(200).send({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
module.exports = { updatePassword, updateUsername, deleteAccount };
