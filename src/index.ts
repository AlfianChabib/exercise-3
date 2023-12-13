import express from "express";
import dotenv from "dotenv";
import { middlewareLogRequest } from "./middleware/log";
import expenseRouter from "./router/expense";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(middlewareLogRequest);

app.use("/expense", expenseRouter);

app.listen(port, () => {
  console.log("Server is running on ", `http://localhost:${port}`);
});
