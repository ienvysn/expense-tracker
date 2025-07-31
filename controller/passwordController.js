const User = require("../models/userModel");
const crypto = require("crypto");

function generateResetToken() {
  return crypto.randomBytes();
}
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.warn("Invalid email format received for password reset:", email);
      return res.status(200).send({
        message: "Invalid mail",
      });
    }
    exisitingUser = await User.findOne({ email: email });
    exisitingUser.resetPasswordToken = generateResetToken();
    console.log(generateResetToken());

    console.log(`Password reset requested for registered email: ${email}`);
    res.status(200).send({ message: "An mail has been set into your account" });
  } catch {
    console.error("Error during password reset email check:", error);
    res.status(500).send({ message: "Not Found email" });
  }
};

module.export = { checkEmail };
