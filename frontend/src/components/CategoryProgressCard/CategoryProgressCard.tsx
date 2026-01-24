"use client";

import { Box, Typography } from "@mui/material";
import { ProvisionProgressCircle } from "@/components/ProvisionProgressCircle";
import { useCurrency } from "@/hooks/useCurrency";
import type { CategoryWithProgress } from "@/budget/hooks";

interface CategoryProgressCardProps {
  category: CategoryWithProgress;
}

export function CategoryProgressCard({ category }: CategoryProgressCardProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        p: { xs: 2.5, md: 3 },
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Category Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Color Indicator */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: category.color,
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            {category.name}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: "0.75rem",
            }}
          >
            Restante
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color:
                category.totalRemaining >= 0 ? "primary.main" : "error.main",
            }}
          >
            {formatCurrency(category.totalRemaining)}
          </Typography>
        </Box>
      </Box>

      {/* Provisions Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          justifyItems: "center",
        }}
      >
        {category.provisions.map((provision) => (
          <ProvisionProgressCircle
            key={provision.id}
            name={provision.name}
            amount={provision.amount}
            remaining={provision.remaining}
            percentage={provision.percentage}
            color={category.color}
          />
        ))}
      </Box>
    </Box>
  );
}
