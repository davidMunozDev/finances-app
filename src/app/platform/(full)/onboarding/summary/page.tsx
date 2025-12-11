"use client";

import { Box, Typography, Divider } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import CategoryList from "@/components/CategoryList";

interface ExpenseCategory {
  category: string;
  total: number;
}

interface SummaryProps {
  totalIncome?: number;
  expenseCategories?: ExpenseCategory[];
}

export default function Summary({
  totalIncome = 2500,
  expenseCategories = [
    { category: "Casa", total: 570 },
    { category: "Comida", total: 250 },
    { category: "Ocio", total: 120 },
  ],
}: SummaryProps) {
  const totalExpenses = expenseCategories.reduce(
    (sum, cat) => sum + cat.total,
    0
  );

  // Colores para las categorías
  const colors = [
    "#FF6B6B", // Rojo
    "#4ECDC4", // Turquesa
    "#FFE66D", // Amarillo
    "#FF8C42", // Naranja
    "#A8E6CF", // Verde claro
    "#95E1D3", // Verde agua
    "#F38181", // Rosa
    "#AA96DA", // Morado
  ];

  // Datos para el gráfico
  const chartData = expenseCategories.map((cat, index) => ({
    id: cat.category,
    value: cat.total,
    label: cat.category,
    color: colors[index % colors.length],
  }));

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      {/* Gráfico Semicircular */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        {/* Gráfico de Semicírculo */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 80,
                outerRadius: 110,
                paddingAngle: 2,
                cornerRadius: 4,
                startAngle: -90,
                endAngle: 90,
              },
            ]}
            colors={colors}
            margin={{ top: 70, bottom: 0, left: 0, right: 0 }}
            width={380}
            height={150}
            slotProps={{
              legend: { sx: { display: "none" } },
            }}
            sx={{
              "& .MuiPieArc-root": {
                stroke: "none",
              },
            }}
          />
          {/* Texto Central */}
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1,
                fontSize: { xs: "2.5rem", sm: "3rem" },
              }}
            >
              {((totalExpenses / totalIncome) * 100).toFixed(0)}%
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                display: "block",
                mt: 0.5,
              }}
            >
              Gastos
            </Typography>
          </Box>
        </Box>

        {/* Totales debajo del gráfico */}
        <Box
          sx={{
            display: "flex",
            gap: 8,
            mt: 3,
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                display: "block",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Ingresos totales
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "success.main",
                fontSize: "1.25rem",
              }}
            >
              ${totalIncome.toFixed(0)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                display: "block",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Gastos totales
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "error.main",
                fontSize: "1.25rem",
              }}
            >
              ${totalExpenses.toFixed(0)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Lista de Categorías */}
      <CategoryList categories={expenseCategories} colors={colors} />
    </Box>
  );
}
