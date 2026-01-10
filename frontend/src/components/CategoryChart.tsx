"use client";

import { Box, Typography, Divider } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import CategoryList from "@/components/CategoryList";
import { useCurrency } from "@/hooks/useCurrency";

interface CategoryData {
  category: string;
  total: number;
}

interface CategoryChartProps {
  categories: CategoryData[];
  totalIncome: number;
  totalExpenses: number;
}

// Colores para las categorías
const CHART_COLORS = [
  "#FF6B6B", // Rojo
  "#4ECDC4", // Turquesa
  "#FFE66D", // Amarillo
  "#FF8C42", // Naranja
  "#A8E6CF", // Verde claro
  "#95E1D3", // Verde agua
  "#F38181", // Rosa
  "#AA96DA", // Morado
];

export default function CategoryChart({
  categories,
  totalIncome,
  totalExpenses,
}: CategoryChartProps) {
  const { formatCurrency } = useCurrency();

  // Datos para el gráfico
  const chartData = categories.map((cat, index) => ({
    id: cat.category,
    value: cat.total,
    label: cat.category,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  // Si no hay datos, mostrar valores por defecto
  const displayIncome = totalIncome || 0;
  const displayExpenses = totalExpenses || 0;
  const displayChartData =
    chartData.length > 0
      ? chartData
      : [{ id: "Sin datos", value: 100, label: "Sin datos", color: "#E0E0E0" }];

  return (
    <Box>
      {/* Gráfico Semicircular */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
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
                data: displayChartData,
                innerRadius: 80,
                outerRadius: 110,
                paddingAngle: 2,
                cornerRadius: 4,
                startAngle: -90,
                endAngle: 90,
              },
            ]}
            colors={CHART_COLORS}
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
              {displayIncome > 0
                ? ((displayExpenses / displayIncome) * 100).toFixed(0)
                : "0"}
              %
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
            gap: { xs: 4, sm: 8 },
            mt: 2,
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
                fontSize: "1.25rem",
              }}
            >
              {formatCurrency(displayIncome)}
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
              {formatCurrency(displayExpenses)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Lista de Categorías */}
      <CategoryList categories={categories} colors={CHART_COLORS} />
    </Box>
  );
}

export { CHART_COLORS };
