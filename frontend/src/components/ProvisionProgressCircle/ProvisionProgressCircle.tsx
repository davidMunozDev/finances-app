"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { useCurrency } from "@/hooks/useCurrency";

interface ProvisionProgressCircleProps {
  name: string;
  amount: number;
  remaining: number;
  percentage: number;
  color: string;
}

export function ProvisionProgressCircle({
  name,
  amount,
  remaining,
  percentage,
  color,
}: ProvisionProgressCircleProps) {
  const { formatCurrency } = useCurrency();

  // Determine if overbudget
  const isOverBudget = percentage > 100;
  const displayPercentage = Math.min(percentage, 100);

  // Get first letter of provision name
  const firstLetter = name.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {/* Circular Progress with Letter Badge */}
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          width: 120,
          height: 120,
        }}
      >
        {/* Background Circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          thickness={4}
          sx={{
            color: "grey.200",
            position: "absolute",
          }}
        />

        {/* Progress Circle */}
        <CircularProgress
          variant="determinate"
          value={displayPercentage}
          size={120}
          thickness={4}
          sx={{
            color: isOverBudget ? "error.main" : color,
            position: "absolute",
            transform: "rotate(-90deg) !important",
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            },
          }}
        />

        {/* Center Content */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {/* Letter Badge */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: isOverBudget ? "error.main" : color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 0.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: 700,
              }}
            >
              {firstLetter}
            </Typography>
          </Box>

          {/* Percentage */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isOverBudget ? "error.main" : "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            {percentage.toFixed(0)}%
          </Typography>
        </Box>
      </Box>

      {/* Provision Name */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          color: "text.primary",
          maxWidth: 120,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Typography>

      {/* Remaining Amount */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: isOverBudget ? "error.main" : "primary.main",
          textAlign: "center",
        }}
      >
        {formatCurrency(remaining)}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textAlign: "center",
        }}
      >
        restante
      </Typography>

      {/* Total Budgeted */}
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textAlign: "center",
        }}
      >
        de {formatCurrency(amount)}
      </Typography>
    </Box>
  );
}
