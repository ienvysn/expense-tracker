const User = require("../models/userModel");
const crypto = require("crypto");
const sendEmail = require("../utils/email"); // Make sure this path is correct
const path = require("path");
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.warn("Invalid email format received for password reset:", email);
      return res.status(200).send({
        message:
          "If an account with that email exists, a password reset link has been sent to your email address.",
      });
    }

    let existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      console.log(`Password reset requested for UNREGISTERED email: ${email}`);
      return res.status(200).send({
        message:
          "If an account with that email exists, a password reset link has been sent to your email address.",
      });
    }

    const plainTextToken = generateResetToken();

    const hashedToken = crypto
      .createHash("sha256")
      .update(plainTextToken)
      .digest("hex");

    existingUser.passwordResetToken = hashedToken;
    existingUser.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

    await existingUser.save({ validateBeforeSave: false });
    const resetURL = `http://localhost:3000/api/forgot-password/${plainTextToken}`;
    sendEmail(email, resetURL);
  } catch (error) {
    console.error("Unexpected error during password reset request:", error);
    res.status(200).send({
      message: "Error sending mail. Try aain later",
    });
  }
};

const comapareToken = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).send("Error updating password. Token invalid or expired");
    }
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "reset-password.html"
    );
    res.sendFile(filePath, (err) => {
      // This callback function runs if sendFile fails
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res
            .status(500)
            .send("Error: Could not display the password reset page.");
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating password.");
  }
};

const updatePassword = async (req, res) => {
  if (req.body.password !== req.body.passwordConfirm) {
    return res.status(400).send("Passwords do not match.");
  }

  User.password = req.body.password;
  User.passwordResetToken = undefined;
  User.passwordResetExpires = undefined;
};
module.exports = { checkEmail, comapareToken };
