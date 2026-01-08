"use client";

import { InputAdornment } from "@mui/material";
import { CalendarTodayOutlined, EventOutlined } from "@mui/icons-material";
import { FormSelect, FormTextField } from "@/components";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { DAYS_OF_WEEK, DAYS_OF_MONTH } from "@/config/budget";

interface PeriodDynamicFieldProps {
  control: Control<any>;
  period: string;
  errors?: FieldErrors;
}

export default function PeriodDynamicField({
  control,
  period,
  errors = {},
}: PeriodDynamicFieldProps) {
  switch (period) {
    case "weekly":
      return (
        <Controller
          name="dayOfWeek"
          control={control}
          render={({ field }) => (
            <FormSelect
              {...field}
              label="Día de inicio"
              error={!!errors.dayOfWeek}
              startIcon={
                <CalendarTodayOutlined sx={{ color: "text.secondary" }} />
              }
              options={DAYS_OF_WEEK.map((day) => ({
                value: day.value,
                label: day.label,
              }))}
            />
          )}
        />
      );
    case "monthly":
      return (
        <Controller
          name="dayOfMonth"
          control={control}
          render={({ field }) => (
            <FormSelect
              {...field}
              label="Día del mes"
              error={!!errors.dayOfMonth}
              startIcon={
                <CalendarTodayOutlined sx={{ color: "text.secondary" }} />
              }
              options={DAYS_OF_MONTH.map((day) => ({
                value: day.value,
                label: day.label,
              }))}
            />
          )}
        />
      );
    case "yearly":
      return (
        <Controller
          name="yearlyDate"
          control={control}
          render={({ field }) => (
            <FormTextField
              {...field}
              label="Fecha de inicio"
              type="date"
              error={!!errors.yearlyDate}
              helperText={errors.yearlyDate?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventOutlined sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.paper",
                },
              }}
            />
          )}
        />
      );
    default:
      return null;
  }
}
