"use client";

import { Box, TextField, TextFieldProps, Typography } from "@mui/material";
import { forwardRef } from "react";

interface FormTextFieldProps extends Omit<TextFieldProps, "variant"> {
  label: string;
}

export const FormTextField = forwardRef<HTMLInputElement, FormTextFieldProps>(
  ({ label, ...props }, ref) => {
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
        <TextField {...props} ref={ref} fullWidth />
      </Box>
    );
  }
);

FormTextField.displayName = "FormTextField";
