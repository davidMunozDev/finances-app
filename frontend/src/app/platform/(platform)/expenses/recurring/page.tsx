"use client";

import { Box, Typography } from "@mui/material";
import { DashboardCard } from "@/dashboard/components/DashboardCard";

export default function RecurrentesPage() {
  return (
    <Box
      sx={{
        px: { xs: 2.5, sm: 3, md: 4, lg: 5 },
        py: { xs: 2.5, sm: 3, md: 4 },
        pb: { xs: 12, md: 4 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, lg: 4 },
          maxWidth: { xs: "100%", lg: 900 },
          mx: "auto",
        }}
      >
        <DashboardCard>
          <Box
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                fontWeight: 500,
              }}
            >
              Próximamente: Gastos Recurrentes
            </Typography>
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}
