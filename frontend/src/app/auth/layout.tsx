"use client";

import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #2F7EF8 0%, #1E90FF 25%, #00D4FF 50%, #00F5A0 75%, #00D9A3 100%)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        p: { xs: 2, sm: 3 },
        "@keyframes gradient": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      }}
    >
      {children}
    </Box>
  );
}
