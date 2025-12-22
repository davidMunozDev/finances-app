"use client";

import { Paper, Box, IconButton } from "@mui/material";
import { useState } from "react";
import Link from "next/link";
import { mainNavItems } from "@/config/navigation";

export default function Footer() {
  const [selected, setSelected] = useState(0);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: "none",
        display: { xs: "block", md: "none" },
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
      }}
      elevation={0}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          height: 72,
          backgroundColor: "background.paper",
          px: 2,
          py: 1.5,
        }}
      >
        {mainNavItems.map((item, index) => {
          const Icon = item.icon;
          const isSelected = selected === index;
          const isCenter = index === 2;

          return (
            <IconButton
              key={index}
              component={Link}
              href={item.href}
              onClick={() => setSelected(index)}
              sx={{
                width: isCenter ? 56 : 48,
                height: isCenter ? 56 : 48,
                backgroundColor: isCenter
                  ? "primary.main"
                  : isSelected
                  ? "rgba(47, 126, 248, 0.1)"
                  : "transparent",
                color: isCenter
                  ? "white"
                  : isSelected
                  ? "primary.main"
                  : "text.secondary",
                borderRadius: isCenter ? "50%" : 2,
                boxShadow: isCenter
                  ? "0 4px 12px rgba(47, 126, 248, 0.3)"
                  : "none",
                transform: isCenter ? "translateY(-8px)" : "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: isCenter
                    ? "primary.dark"
                    : "rgba(47, 126, 248, 0.1)",
                  transform: isCenter ? "translateY(-10px)" : "scale(1.05)",
                },
              }}
            >
              <Icon fontSize={isCenter ? "medium" : "small"} />
            </IconButton>
          );
        })}
      </Box>
    </Paper>
  );
}
