const mongodb = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    sparse: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    sparse: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  resetPasswordToken: {
    type: String,
    required: false, // Not required initially, only when a reset is requested
  },
  resetPasswordExpires: {
    type: Date,
    required: false, // Not required initially
  },
  displayName: String,
  photo: String,
});

//hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //only has when password is newly created or changed.
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
