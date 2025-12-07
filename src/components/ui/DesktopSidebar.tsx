"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import { Settings, Person } from "@mui/icons-material";
import Link from "next/link";
import { useState } from "react";
import { mainNavItems } from "@/config/navigation";

const DRAWER_WIDTH = 280;

export default function DesktopSidebar() {
  const [selected, setSelected] = useState(0);

  const bottomItems = [
    { text: "Configuración", icon: Settings, href: "#" },
    { text: "Perfil", icon: Person, href: "#" },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          borderRight: "none",
          backgroundColor: "background.paper",
          top: 72,
          height: "calc(100% - 72px)",
        },
      }}
    >
      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100%", py: 3 }}
      >
        <List sx={{ flex: 1, px: 3 }}>
          {mainNavItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={selected === index}
                  onClick={() => setSelected(index)}
                  sx={{
                    borderRadius: 3,
                    py: 1.75,
                    px: 2,
                    transition: "all 0.2s ease",
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(47, 126, 248, 0.3)",
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "rgba(47, 126, 248, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 44,
                      color: selected === index ? "inherit" : "text.secondary",
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: selected === index ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <List sx={{ px: 3 }}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    "&:hover": {
                      backgroundColor: "rgba(47, 126, 248, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 44,
                      color: "text.secondary",
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
