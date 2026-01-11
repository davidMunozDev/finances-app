"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";

interface StructuredDataDisplayProps {
  data: Record<string, unknown> | unknown[];
}

export function StructuredDataDisplay({ data }: StructuredDataDisplayProps) {
  const theme = useTheme();

  if (!data) return null;

  // Handle array of objects (transactions, expenses, etc.)
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    const keys = Object.keys(data[0] as Record<string, unknown>);

    return (
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            maxHeight: 400,
            maxWidth: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: alpha(theme.palette.grey[500], 0.05),
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: "4px",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.5),
              },
            },
          }}
        >
          <Table
            size="small"
            stickyHeader
            sx={{ width: "100%", tableLayout: "fixed" }}
          >
            <TableHead>
              <TableRow>
                {keys.map((key) => (
                  <TableCell
                    key={key}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      fontWeight: 600,
                      textTransform: "capitalize",
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      px: 1.5,
                      py: 1,
                      fontSize: "0.75rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {key.replace(/_/g, " ")}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    },
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  {keys.map((key) => {
                    const value = (row as Record<string, unknown>)[key];
                    return (
                      <TableCell
                        key={key}
                        sx={{
                          px: 1.5,
                          py: 1,
                          fontSize: "0.813rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {typeof value === "number"
                          ? value.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : String(value ?? "-")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Handle single object (summary, details, etc.)
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);

    return (
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {entries.map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 0.5,
                  borderBottom: `1px solid ${alpha(
                    theme.palette.divider,
                    0.5
                  )}`,
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                    textTransform: "capitalize",
                  }}
                >
                  {key.replace(/_/g, " ")}
                </Typography>
                {typeof value === "number" ? (
                  <Chip
                    label={value.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.dark,
                    }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {String(value ?? "-")}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Fallback for other types
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <Typography
        variant="body2"
        component="pre"
        sx={{
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          margin: 0,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Typography>
    </Paper>
  );
}
