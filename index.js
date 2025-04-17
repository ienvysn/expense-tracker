const express = require("express");
const expenseRouter = require("./router/expense");
const connectDB = require("./db.js");
const app = express();
app.use("/api/expenses", expenseRouter);

app.listen(3000, () => {
  console.log("Server is up");
});
