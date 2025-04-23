const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    // check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    // create user
    const newUser = await User.create({ username, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find User
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    // Check password
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = { register, login };
