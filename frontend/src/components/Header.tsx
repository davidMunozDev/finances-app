"use client";

import { AppBar, Toolbar, IconButton, Box, Avatar } from "@mui/material";
import BudgetSelector from "./BudgetSelector";
import SettingsModal from "./SettingsModal";
import { useState } from "react";
import { useCurrentUser } from "@/data/auth/hooks";

function getInitials(
  user: { full_name?: string | null; email?: string } | undefined,
) {
  if (user?.full_name) {
    return user.full_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (user?.email) {
    return user.email[0].toUpperCase();
  }
  return "?";
}

export default function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useCurrentUser();
  const initials = getInitials(user);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "none",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2.5, md: 4 },
        }}
      >
        {/* Budget Selector */}
        <Box sx={{ flex: 1 }}>
          <BudgetSelector />
        </Box>

        {/* Icons */}

        <IconButton
          onClick={() => setSettingsOpen(true)}
          sx={{
            p: 0,
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          <Avatar
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              bgcolor: "primary.main",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Toolbar>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </AppBar>
  );
}
