const User = require("../models/userModel");
const crypto = require("crypto");
const sendEmail = require("../utils/email"); // Make sure this path is correct
const path = require("path");
const {
  cloudresourcemanager,
} = require("googleapis/build/src/apis/cloudresourcemanager");
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

//checks that the email is registed and sends mail
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

    existingUser.resetPasswordToken = plainTextToken;
    existingUser.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    console.log("added");
    console.log(existingUser);

    await existingUser.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:3000/api/forgot-password/${plainTextToken}`;

    await sendEmail(email, resetURL);

    return res.status(200).send({
      message:
        "If an account with that email exists, a password reset link has been sent to your email address.",
    });
  } catch (error) {
    console.error("Unexpected error during password reset request:", error);
    return res.status(200).send({
      message: "Error sending mail. Try again later",
    });
  }
};

//comaprease the token
const comapareToken = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log(user);
    if (!user) {
      return res
        .status(400)
        .send("Error updating password. Token invalid or expired");
    }
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "reset-password.html"
    );

    console.log("path found");
    res.sendFile(filePath, (err) => {
      // This callback function runs if sendFile fails
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          return res
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

//update the passsword
const updatePassword = async (req, res) => {
  try {
    const { token, password, passwordConfirm } = req.body;

    if (!token || !password || !passwordConfirm) {
      return res
        .status(400)
        .send(
          "Please provide a token, a new password, and confirm the password."
        );
    }

    if (password !== passwordConfirm) {
      return res.status(400).send("Passwords do not match.");
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Token is invalid or has expired.");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).send("Password has been updated successfully.");
  } catch (error) {
    console.error("ERROR UPDATING PASSWORD:", error);
    res.status(500).send("An error occurred while updating the password.");
  }
};
module.exports = { checkEmail, comapareToken, updatePassword };
