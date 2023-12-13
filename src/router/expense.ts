import express from "express";
import {
  deleteExpense,
  getExpenseDetail,
  getExpenses,
  patchExpense,
  postNewExpense,
} from "../controller/expense";

const router = express.Router();

// GET expense list
router.get("/", getExpenses);

// GET expense detail
router.get("/:id", getExpenseDetail);

// POST new expense
router.post("/", postNewExpense);

// UPDATE expense
router.patch("/:id", patchExpense);

// DELETE - DELETE
router.delete("/:id", deleteExpense);

export default router;
