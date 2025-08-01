// ienvysn/expense-tracker/expense-tracker-ebc0b1d22e6ab2025a481179695e0bc953aee57f/controller/authController.js

const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email already registered" });

    // create user
    const newUser = await User.create({ username, email, password });

    // Generate JWT token for the newly registered user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Match the expiration with your login token
    });

    // Send the token back to the client
    res.status(201).json({ message: "User registered successfully", token }); // Add token here
  } catch (err) {
    console.error("Registration error:", err); // Add error logging for debugging
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message }); // Send error message for better debugging
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find User
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: "Invalid email",
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
    console.error("Login error:", error); // Add error logging
    res.status(500).json({ error: error.message }); // Send error message
  }
};

module.exports = { register, login };
