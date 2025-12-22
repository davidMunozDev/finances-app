import TransactionItemList from "./TransactionItemList";
import { Control } from "react-hook-form";

interface IncomeListProps {
  control: Control<any>;
  errors?: any;
  name?: string;
}

export default function IncomeList({
  control,
  errors,
  name = "incomes",
}: IncomeListProps) {
  return (
    <TransactionItemList
      control={control}
      errors={errors}
      name={name}
      type="income"
    />
  );
}
