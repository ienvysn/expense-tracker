const express = require("express");
const expenseRouter = require("./router/expense");
const connectDB = require("./db/db");

const app = express();
app.use(express.json());
app.use("/api/expenses", expenseRouter);

app.listen(3000, () => {
  console.log("Server is up");
});
