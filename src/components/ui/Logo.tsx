"use client";

import { Box, Typography } from "@mui/material";

interface LogoProps {
  size?: number;
  letter?: string;
}

export function Logo({ size = 56, letter = "F" }: LogoProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        boxShadow: "0px 4px 12px rgba(47, 126, 248, 0.3)",
      }}
    >
      <Typography sx={{ fontSize: `${size * 0.5}px`, fontWeight: "bold" }}>
        {letter}
      </Typography>
    </Box>
  );
}
