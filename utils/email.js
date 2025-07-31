const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

async function sendEmail(email, message) {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: message,
    };
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = sendEmail;
