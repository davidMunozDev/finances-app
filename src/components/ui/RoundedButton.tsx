"use client";

import { Button, ButtonProps } from "@mui/material";
import { forwardRef } from "react";

interface RoundedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const RoundedButton = forwardRef<HTMLButtonElement, RoundedButtonProps>(
  ({ children, sx, ...props }, ref) => {
    return (
      <Button
        {...props}
        ref={ref}
        variant="contained"
        size="large"
        fullWidth
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "semibold",
          borderRadius: 50,
          textTransform: "none",
          ...sx,
        }}
      >
        {children}
      </Button>
    );
  }
);

RoundedButton.displayName = "RoundedButton";
