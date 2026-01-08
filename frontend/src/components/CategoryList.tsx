"use client";

import { Box, Typography } from "@mui/material";
import { useCurrency } from "@/hooks/useCurrency";

interface Category {
  category: string;
  total: number;
}

interface CategoryListProps {
  categories: Category[];
  colors?: string[];
}

const defaultColors = [
  "#FF6B6B", // Rojo
  "#4ECDC4", // Turquesa
  "#FFE66D", // Amarillo
  "#FF8C42", // Naranja
  "#A8E6CF", // Verde claro
  "#95E1D3", // Verde agua
  "#F38181", // Rosa
  "#AA96DA", // Morado
];

export default function CategoryList({
  categories,
  colors = defaultColors,
}: CategoryListProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Box sx={{ textAlign: "left" }}>
      {categories.map((category, index) => (
        <Box
          key={category.category}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.5,
            borderBottom:
              index < categories.length - 1
                ? (theme) => `1px solid ${theme.palette.divider}`
                : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 1,
                bgcolor: colors[index % colors.length],
              }}
            />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              {category.category}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {formatCurrency(category.total)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
