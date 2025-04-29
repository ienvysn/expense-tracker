const User = require("../models/userModel");

// GET /api/user/balance
const getBalance = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ balance: user.balance });
};

module.exports = { getBalance };
