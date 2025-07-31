const User = require("../models/userModel");
const crypto = require("crypto");
const sendEmail = require("../utils/email"); // Make sure this path is correct

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
    const resetURL = `http://localhost:3000/reset-password?token=${plainTextToken}`;
    sendEmail(email, resetURL);
    console.log("mail sent");
  } catch (error) {
    console.error("Unexpected error during password reset request:", error);
    res.status(200).send({
      message: "Error sending mail. Try aain later",
    });
  }
};

module.exports = { checkEmail };
