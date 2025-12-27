"use client";

import TransactionItemList from "./TransactionItemList";
import { Control } from "react-hook-form";

interface ExpenseListProps {
  control: Control<any>;
  errors?: any;
  name?: string;
}

export default function ExpenseList({
  control,
  errors,
  name = "expenses",
}: ExpenseListProps) {
  return (
    <TransactionItemList
      control={control}
      errors={errors}
      name={name}
      type="expense"
    />
  );
}
