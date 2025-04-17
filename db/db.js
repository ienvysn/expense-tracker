const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.MONGO_URI;
// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

module.exports = main;
