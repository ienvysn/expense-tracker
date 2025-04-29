const express = require("express");
const expenseRouter = require("./router/expense");
const authRoutes = require("./router/auth");
const incomeRoutes = require("./router/income");
const balanceRoutes = require("./router/balance");
const connectDB = require("./db/db");

const app = express();
app.use(express.json());
app.use("/api/expenses", expenseRouter);
app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/balance", balanceRoutes);
app.listen(3000, () => {
  console.log("Server is up");
});
