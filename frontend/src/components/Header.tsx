"use client";

import { AppBar, Toolbar, IconButton, Box, Avatar } from "@mui/material";
import BudgetSelector from "./BudgetSelector";
import SettingsModal from "./SettingsModal";
import { useState } from "react";

export default function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
            DM
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
