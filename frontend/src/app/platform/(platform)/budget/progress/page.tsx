"use client";

import { Box, Typography } from "@mui/material";
import BudgetTabs from "@/components/BudgetTabs";

export default function ProgressPage() {
  return (
    <Box
      sx={{
        px: { xs: 2.5, sm: 3, md: 4, lg: 5 },
        py: { xs: 2.5, sm: 3, md: 4 },
        pb: { xs: 12, md: 4 },
      }}
    >
      {/* Tabs */}
      <BudgetTabs />

      {/* Placeholder Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 4,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Próximamente
        </Typography>
        <Typography variant="body1" color="text.secondary">
          La pestaña de progreso estará disponible próximamente.
        </Typography>
      </Box>
    </Box>
  );
}
