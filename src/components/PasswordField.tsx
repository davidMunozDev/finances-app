"use client";

import { TextFieldProps, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { forwardRef, useState } from "react";
import { FormTextField } from "./FormTextField";

interface PasswordFieldProps extends Omit<TextFieldProps, "variant" | "type"> {
  label: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <FormTextField
        {...props}
        ref={ref}
        label={label}
        type={showPassword ? "text" : "password"}
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
    );
  }
);

PasswordField.displayName = "PasswordField";
