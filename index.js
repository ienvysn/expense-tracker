const express = require("express");
const expenseRouter = require("./router/expense");
const authRoutes = require("./router/auth");
const incomeRoutes = require("./router/income");
const balanceRoutes = require("./router/balance");
const SummaryRoutes = require("./router/summary");
const connectDB = require("./db/db");
const path = require("path");
const app = express();
app.use(express.json());

app.use("/api/expenses", expenseRouter);
app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/summary", SummaryRoutes);

app.use(express.static(path.join(__dirname, "public")));
app.listen(3000, () => {
  console.log("Server is up");
});
