"use client";

import { ReactNode } from "react";
import { Box } from "@mui/material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import DesktopSidebar from "@/components/ui/DesktopSidebar";

const DRAWER_WIDTH = 280;

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      {/* Header */}
      <Header />

      <Box sx={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: {
              xs: "100%",
              md: `calc(100% - ${DRAWER_WIDTH}px)`,
            },
            minHeight: {
              xs: "calc(100vh - 64px - 72px)", // viewport - header - footer
              md: "calc(100vh - 72px)", // viewport - header
            },
            px: {
              xs: 2.5,
              sm: 3,
              md: 4,
              lg: 5,
            },
            py: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },
            pb: {
              xs: 12, // Extra padding bottom for mobile footer
              md: 4,
            },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Mobile Footer */}
      <Footer />
    </Box>
  );
}
