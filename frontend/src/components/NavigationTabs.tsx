"use client";

import { Tabs, Tab, Box } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

export interface TabItem {
  label: string;
  path: string;
}

interface NavigationTabsProps {
  tabs: TabItem[];
}

export default function NavigationTabs({ tabs }: NavigationTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentTabIndex = () => {
    // Buscar coincidencia exacta primero
    const exactMatch = tabs.findIndex((tab) => tab.path === pathname);
    if (exactMatch !== -1) {
      return exactMatch;
    }

    // Buscar la coincidencia más larga que empiece con el pathname
    let bestMatch = 0;
    let longestMatch = 0;

    tabs.forEach((tab, index) => {
      if (pathname.startsWith(tab.path) && tab.path.length > longestMatch) {
        longestMatch = tab.path.length;
        bestMatch = index;
      }
    });

    return bestMatch;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    router.push(tabs[newValue].path);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Tabs
        value={getCurrentTabIndex()}
        onChange={handleChange}
        centered
        sx={{
          "& .MuiTabs-indicator": {
            height: 3,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              px: 3,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
