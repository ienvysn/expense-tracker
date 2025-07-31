const express = require("express");
const expenseRouter = require("./router/expense");
const authRoutes = require("./router/auth");
const incomeRoutes = require("./router/income");
const balanceRoutes = require("./router/balance");
const summaryRoutes = require("./router/summary");
const currencyRoutes = require("./router/currency");
const profileRoutes = require("./router/profile");
const passwordRoutes = require("./router/password.js");

//auth
const session = require("express-session");

const passport = require("passport"); // loads the passport library
require("./auth/passport"); // ← loads passport.js

//redis
const { redisClient, connectRedis } = require("./redisClient");
connectRedis().catch((err) => {
  console.error("Failed to connect to Redis:", err);
});
//DB
const connectDB = require("./db/db");
const path = require("path");
const app = express();
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Auth route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Redirect URI
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = req.user.token;

    res.redirect(`/auth-success.html?token=${token}`);
  }
);

//APIs
app.use("/api/expenses", expenseRouter);
app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/forgot-password", passwordRoutes);
//Server
app.use(express.static(path.join(__dirname, "public")));
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});
app.get("/income", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "income.html"));
});

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

app.listen(3000, () => {
  console.log("Server is up");
});
