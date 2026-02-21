"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { useCurrency } from "@/hooks/useCurrency";
import { DashboardCard } from "./DashboardCard";

interface SpendingGraphProps {
  data: Array<{ date: string; amount: number }>;
  total: number;
  period: string;
  isLoading?: boolean;
}

export function SpendingGraph({
  data,
  total,
  period,
  isLoading = false,
}: SpendingGraphProps) {
  const { formatCurrency } = useCurrency();

  if (isLoading) {
    return (
      <DashboardCard isLoading>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
      </DashboardCard>
    );
  }

  // Extract dates and amounts for the chart
  const dates = data.map((item) => {
    const date = new Date(item.date);
    const day = date.getDate();
    const month = date.toLocaleDateString("es-ES", { month: "short" });

    // Show day/month format to handle cross-month periods
    return `${day} ${month}`;
  });

  const amounts = data.map((item) => item.amount);

  return (
    <DashboardCard>
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: 600,
            display: "block",
            mb: 0.5,
          }}
        >
          Gastado: {period}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 3,
          }}
        >
          {formatCurrency(total)}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "primary.main",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Este período
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Media
          </Typography>
        </Box>

        {data.length > 0 ? (
          <Box sx={{ width: "100%", overflow: "hidden" }}>
            <LineChart
              xAxis={[
                {
                  data: dates,
                  scaleType: "band",
                  hideTooltip: true,
                  disableLine: true,
                  disableTicks: true,
                  tickLabelStyle: {
                    fontSize: 12,
                    fill: "#8C8C8C",
                  },
                },
              ]}
              yAxis={[
                {
                  disableLine: true,
                  disableTicks: true,
                  tickLabelStyle: {
                    fontSize: 0,
                  },
                },
              ]}
              series={[
                {
                  data: amounts,
                  area: true,
                  color: "#A78BFA",
                  showMark: false,
                  curve: "monotoneX",
                },
              ]}
              height={180}
              margin={{ top: 0, bottom: 30, left: 0, right: 0 }}
              sx={{
                width: "100%",
                "& .MuiLineElement-root": {
                  strokeWidth: 3,
                },
                "& .MuiAreaElement-root": {
                  fill: "url(#spendingGradient)",
                  fillOpacity: 1,
                },
                "& .MuiChartsAxis-line": {
                  display: "none",
                },
                "& .MuiChartsAxis-tick": {
                  display: "none",
                },
              }}
              slotProps={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                legend: { hidden: true } as any,
              }}
            >
              <defs>
                <linearGradient
                  id="spendingGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </LineChart>
          </Box>
        ) : (
          <Box
            sx={{
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No hay datos para mostrar
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
}
