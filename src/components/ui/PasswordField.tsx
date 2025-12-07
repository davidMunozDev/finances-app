"use client";

import {
  Box,
  TextField,
  TextFieldProps,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { forwardRef, useState } from "react";

interface PasswordFieldProps extends Omit<TextFieldProps, "variant" | "type"> {
  label: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

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
        <TextField
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          fullWidth
          slotProps={{
            input: {
              ...props.slotProps?.input,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    );
  }
);

PasswordField.displayName = "PasswordField";
