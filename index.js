const express = require("express");
const expenseRouter = require("./router/expense");
const authRoutes = require("./router/auth");
const incomeRoutes = require("./router/income");
const balanceRoutes = require("./router/balance");
const summaryRoutes = require("./router/summary");
const currencyRoutes = require("./router/currency");
const profileRoutes = require("./router/profile");

const connectDB = require("./db/db");
const path = require("path");
const app = express();
app.use(express.json());

app.use("/api/expenses", expenseRouter);
app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/profile", profileRoutes);

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
