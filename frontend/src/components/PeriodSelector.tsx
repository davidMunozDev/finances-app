"use client";

import { CalendarTodayOutlined } from "@mui/icons-material";
import { FormSelect } from "@/components";
import { Control, Controller, FieldError } from "react-hook-form";
import { PERIODS } from "@/config/budget";

interface PeriodSelectorProps {
  control: Control<any>;
  name?: string;
  error?: FieldError;
  label?: string;
}

export default function PeriodSelector({
  control,
  name = "period",
  error,
  label = "Periodo",
}: PeriodSelectorProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormSelect
          {...field}
          label={label}
          error={!!error}
          startIcon={<CalendarTodayOutlined sx={{ color: "text.secondary" }} />}
          options={PERIODS.map((p) => ({
            value: p.value,
            label: p.label,
            subtitle: p.subtitle,
          }))}
        />
      )}
    />
  );
}
