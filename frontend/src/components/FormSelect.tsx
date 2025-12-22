"use client";

import {
  Box,
  MenuItem,
  Select,
  FormControl,
  Typography,
  InputAdornment,
  SelectProps,
} from "@mui/material";
import { ReactNode } from "react";

interface FormSelectProps extends Omit<SelectProps, "label"> {
  label: string;
  startIcon?: ReactNode;
  options: Array<{
    value: string;
    label: string;
    subtitle?: string;
    icon?: ReactNode;
  }>;
}

export default function FormSelect({
  label,
  startIcon,
  options,
  ...props
}: FormSelectProps) {
  return (
    <Box>
      <Typography
        component="label"
        sx={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: "medium",
          color: "text.primary",
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <FormControl fullWidth>
        <Select
          {...props}
          startAdornment={
            startIcon ? (
              <InputAdornment position="start">{startIcon}</InputAdornment>
            ) : undefined
          }
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            "& .MuiSelect-select": {
              py: 1.75,
            },
            ...props.sx,
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {option.icon && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 30,
                    }}
                  >
                    {option.icon}
                  </Box>
                )}
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "text.primary",
                    }}
                  >
                    {option.label}
                  </Typography>
                  {option.subtitle && (
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      {option.subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
