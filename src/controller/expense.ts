import { Request, Response } from "express";
import { readFileSync, writeFileSync } from "fs";
import { httpStatus } from "../utils/httpStatus";
import path from "path";
import moment from "moment";

// Get expense list
// Get expense details
// Create new expense data
// Edit expense data
// Delete expense data
// Get total expense by date range
// Get total expense by category

const getCurrentId = (expenses: ExpenseEntity[]): number => {
  if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
    return 1;
  }

  const lastId = expenses[expenses.length - 1].id;
  return lastId;
};

const getFilePath = (): string => {
  return path.join(__dirname, "../../data/expense.json");
};

export type ExpenseEntity = {
  id: number;
  name: string;
  nominal: number;
  category: string;
  date: Date;
};

export interface ExpenseInput {
  name: string;
  nominal: number;
  category: string;
}

const readExpense = (): ExpenseEntity[] => {
  const path = getFilePath();
  const data = readFileSync(path, "utf-8");
  return JSON.parse(data);
};

const writeExpense = (data: ExpenseEntity[]): ExpenseEntity[] => {
  const path = getFilePath();
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");

  return data;
};

export const getExpenses = (req: Request, res: Response) => {
  const { category, startdate, enddate } = req.query;

  let expenses = readExpense();

  if (category) {
    expenses = expenses.filter(
      (expense) =>
        expense.category.toLowerCase() === String(category).toLowerCase()
    );

    const totalExpenseByCategory = expenses
      .map((expense) => expense.nominal)
      .reduce((a, b) => a + b, 0);

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: "Get Total Expense By Category Success",
      data: [
        {
          category: category,
          totalExpenses: totalExpenseByCategory,
        },
      ],
    });
  }

  if (startdate && enddate) {
    const startDateMoment = moment(String(startdate));
    const endDateMoment = moment(String(enddate));

    if (startDateMoment.isAfter(endDateMoment)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        code: httpStatus.BAD_REQUEST,
        message: "startdate is newer than enddate",
      });
    }
    expenses = expenses.filter(
      (expense) =>
        moment(expense.date).isSameOrBefore(endDateMoment) &&
        moment(expense.date).isSameOrAfter(startDateMoment)
    );

    const totalExpenseByDate = expenses
      .map((expense) => expense.nominal)
      .reduce((a, b) => a + b, 0);

    return res.status(httpStatus.OK).json({
      code: httpStatus.OK,
      message: "Get Total Expense By Date Success",
      data: [
        {
          startdate: startdate,
          enddate: enddate,
          totalExpenses: totalExpenseByDate,
        },
      ],
    });
  }

  return res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    message: "Succes",
    data: expenses,
  });
};

export const getExpenseDetail = (req: Request, res: Response) => {
  const { id } = req.params;
  const expenses = readExpense();

  if (isNaN(parseInt(id))) {
    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: "Id must be integer",
    });
  }

  const expense = expenses.find((item) => item.id === parseInt(id));

  if (!expense) {
    return res.status(httpStatus.NOT_FOUND).json({
      code: httpStatus.NOT_FOUND,
      message: `Expense with id ${id} not found`,
    });
  }

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    status: "success",
    message: "Expense detail",
    data: expense,
  });
};

export const postNewExpense = (req: Request, res: Response) => {
  const { name, category, nominal } = req.body;
  const expenses = readExpense();
  const currentId = getCurrentId(expenses);
  const currentDate = moment().toDate();

  if (!name || !category || !nominal) {
    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: "Name, nominal, and category cannot be empty",
    });
  }

  const inputPayload: ExpenseInput = {
    name,
    nominal,
    category,
  };

  const expense = {
    id: currentId + 1,
    date: currentDate,
    ...inputPayload,
  };

  expenses.push(expense);
  writeExpense(expenses);

  res.status(httpStatus.CREATED).json({
    code: httpStatus.CREATED,
    status: "success",
    message: "Expense created successfully",
    data: expenses,
  });
};

export const patchExpense = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, nominal } = req.body;

  if (isNaN(parseInt(id))) {
    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: "Id must be integer",
    });
  }

  const expenses = readExpense();
  let expense = expenses.find((item) => item.id === parseInt(id));

  if (!expense) {
    return res.status(httpStatus.NOT_FOUND).json({
      code: httpStatus.NOT_FOUND,
      message: `Expense with id ${id} not found`,
    });
  }

  const indexOfCurrentExpense = expenses
    .map((expense) => expense.id)
    .indexOf(parseInt(id));

  const newExpense = {
    id: expense.id,
    name: name || expense.name,
    nominal: nominal || expense.nominal,
    category: category || expense.category,
    date: expense.date,
  };

  expenses.splice(indexOfCurrentExpense, 1, newExpense);

  writeExpense(expenses);

  return res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    message: "Success",
    data: expenses,
  });
};

export const deleteExpense = (req: Request, res: Response) => {
  const expenses = readExpense();
  const { id } = req.params;
  const expense = expenses.findIndex((item) => item.id === parseInt(id));

  if (isNaN(parseInt(id))) {
    return res.status(httpStatus.BAD_REQUEST).json({
      code: httpStatus.BAD_REQUEST,
      message: "Id must be integer",
    });
  }

  if (!expense) {
    return res.status(httpStatus.NOT_FOUND).json({
      code: httpStatus.NOT_FOUND,
      message: `Expense with id ${id} not found`,
    });
  }

  const indexOfCurrentExpense = expenses
    .map((expense) => expense.id)
    .indexOf(parseInt(id));

  expenses.splice(indexOfCurrentExpense, 1);

  writeExpense(expenses);

  res.status(httpStatus.OK).json({
    code: httpStatus.OK,
    message: "DELETE data success",
    data: expenses,
  });
};
