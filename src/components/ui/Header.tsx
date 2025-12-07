"use client";

import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import { Settings, MoreVert } from "@mui/icons-material";
import Link from "next/link";
import BudgetSelector from "./BudgetSelector";

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, md: 1.5 },
            alignItems: "center",
          }}
        >
          <IconButton
            component={Link}
            href="#"
            sx={{
              color: "text.secondary",
              width: { xs: 40, md: 44 },
              height: { xs: 40, md: 44 },
              "&:hover": {
                backgroundColor: "rgba(47, 126, 248, 0.08)",
                color: "primary.main",
              },
            }}
          >
            <Settings fontSize={isMobile ? "medium" : "medium"} />
          </IconButton>

          <IconButton
            component={Link}
            href="#"
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

          {/* {isMobile && (
            <IconButton
              sx={{
                color: "text.secondary",
                width: 40,
                height: 40,
              }}
            >
              <MoreVert />
            </IconButton>
          )} */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
