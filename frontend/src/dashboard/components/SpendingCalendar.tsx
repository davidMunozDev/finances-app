"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Skeleton,
  Modal,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { DateCalendar } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { es } from "date-fns/locale/es";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { DashboardCard } from "./DashboardCard";
import { Transaction } from "../types";
import { formatDateToString } from "@/utils/dashboard";
import { useLocale } from "@/hooks/useLocale";
import type { FutureTransaction } from "@/utils/recurring";

interface SpendingCalendarProps {
  dailyExpenses: Record<string, number>;
  transactions?: Transaction[];
  futureTransactions?: FutureTransaction[];
  isLoading?: boolean;
  onDateClick?: (date: string) => void;
}

interface CustomPickersDayProps extends PickersDayProps {
  dailyExpenses?: Record<string, number>;
  currencySymbol?: string;
  onDayClick?: (date: Date) => void;
}

function CustomPickersDay(props: CustomPickersDayProps) {
  const {
    dailyExpenses = {},
    currencySymbol = "€",
    onDayClick,
    ...other
  } = props;
  const day = other.day;

  const dateStr = formatDateToString(day);

  const expense = dailyExpenses[dateStr] || 0;
  const isOutside = props.outsideCurrentMonth;

  const handleClick = (event: React.MouseEvent) => {
    if (other.onClick) {
      other.onClick(event as React.MouseEvent<HTMLButtonElement>);
    }
    if (onDayClick && !isOutside) {
      onDayClick(day);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 0.5,
        bgcolor: !isOutside && expense > 0 ? "info.light" : "transparent",
        border: other.selected ? "2px solid" : "none",
        borderColor: other.selected ? "primary.contrastText" : "transparent",
        cursor: "pointer",
        transition: "all 0.2s",
        m: 0.3,
        "&:hover": {
          bgcolor: !isOutside && expense > 0 ? "info.main" : "action.hover",
        },
        opacity: isOutside ? 0.3 : 1,
      }}
      onClick={handleClick}
    >
      <Typography
        sx={{
          fontSize: "0.6rem",
          fontWeight: 500,
          color:
            !isOutside && expense > 0 ? "info.contrastText" : "text.primary",
        }}
      >
        {day.getDate()}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.6rem",
          fontWeight: 600,
          color:
            !isOutside && expense > 0 ? "info.contrastText" : "text.secondary",
        }}
      >
        {Math.round(expense)} {currencySymbol}
      </Typography>
    </Box>
  );
}

export function SpendingCalendar({
  dailyExpenses,
  transactions = [],
  futureTransactions = [],
  isLoading = false,
  onDateClick,
}: SpendingCalendarProps) {
  const { formatCurrency, symbol } = useCurrency();
  const { formatStrDate } = useLocale();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");

  // Combine daily expenses with future transactions
  const combinedDailyExpenses = useMemo(() => {
    const combined = { ...dailyExpenses };

    futureTransactions.forEach((ft) => {
      combined[ft.date] = (combined[ft.date] || 0) + ft.amount;
    });

    return combined;
  }, [dailyExpenses, futureTransactions]);

  const handleDayClick = (date: Date) => {
    const dateStr = formatDateToString(date);
    setSelectedDateStr(dateStr);
    setModalOpen(true);
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const selectedDateTransactions = transactions
    .map((t) => ({
      ...t,
      date: formatStrDate(new Date(t.date), "YYYY-MM-DD"),
    }))
    .filter((t) => t.date === selectedDateStr && t.type === "expense");

  const selectedDateFutureTransactions = futureTransactions.filter(
    (ft) => ft.date === selectedDateStr
  );

  if (isLoading) {
    return (
      <DashboardCard isLoading>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0 }}>
        Calendario de gastos
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DateCalendar
          value={selectedDate}
          onChange={handleDateChange}
          slots={{
            day: CustomPickersDay,
          }}
          slotProps={{
            day: {
              dailyExpenses: combinedDailyExpenses,
              formatCurrency,
              currencySymbol: symbol,
              onDayClick: handleDayClick,
            } as any,
          }}
          sx={{
            width: "100%",
            "& .MuiPickersCalendarHeader-root": {
              paddingLeft: 1,
              paddingRight: 1,
            },
            "& .MuiDayCalendar-header": {
              justifyContent: "space-around",
              paddingLeft: 0,
              paddingRight: 0,
            },
            "& .MuiDayCalendar-weekContainer": {
              justifyContent: "space-around",
              margin: 0,
            },
            "& .MuiPickersDay-root": {
              fontSize: "0.875rem",
              fontWeight: 500,
              margin: 0.5,
            },
            "& .Mui-selected": {
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 700,
              "&:hover": {
                bgcolor: "primary.dark",
              },
            },
            "& .MuiPickersDay-today": {
              border: "2px solid",
              borderColor: "primary.main",
              bgcolor: "transparent",
            },
          }}
        />
      </LocalizationProvider>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Gastos realizados
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "info.main",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Incluye gastos futuros
          </Typography>
        </Box>
      </Box>

      {/* Modal de transacciones */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="transactions-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 },
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              id="transactions-modal-title"
              variant="h6"
              fontWeight={700}
            >
              {selectedDateStr &&
                format(
                  new Date(selectedDateStr + "T00:00:00"),
                  "dd 'de' MMMM 'de' yyyy",
                  {
                    locale: es,
                  }
                )}
            </Typography>
            <IconButton onClick={handleCloseModal} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 2, maxHeight: "calc(80vh - 80px)", overflowY: "auto" }}>
            {selectedDateTransactions.length === 0 &&
            selectedDateFutureTransactions.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No hay transacciones en esta fecha
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {/* Real transactions */}
                {selectedDateTransactions.map((transaction, index) => (
                  <Box key={transaction.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1.5,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {transaction.description}
                          </Typography>
                        }
                        secondary={
                          transaction.category_name && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {transaction.category_name}
                            </Typography>
                          )
                        }
                      />
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        color={
                          transaction.type === "income"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </ListItem>
                  </Box>
                ))}

                {/* Future transactions */}
                {selectedDateFutureTransactions.length > 0 && (
                  <>
                    {selectedDateTransactions.length > 0 && (
                      <Divider sx={{ my: 2 }}>
                        <Chip label="Próximos gastos" size="small" />
                      </Divider>
                    )}
                    {selectedDateFutureTransactions.map(
                      (transaction, index) => (
                        <Box key={transaction.id}>
                          {index > 0 && <Divider />}
                          <ListItem
                            sx={{
                              px: 0,
                              py: 1.5,
                              opacity: 0.7,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography variant="body1" fontWeight={600}>
                                    {transaction.description}
                                  </Typography>
                                  <Chip
                                    label={
                                      transaction.frequency === "weekly"
                                        ? "Semanal"
                                        : transaction.frequency === "monthly"
                                        ? "Mensual"
                                        : "Anual"
                                    }
                                    size="small"
                                    color="info"
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                  />
                                </Box>
                              }
                              secondary={
                                transaction.category_name && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {transaction.category_name}
                                  </Typography>
                                )
                              }
                            />
                            <Typography
                              variant="body1"
                              fontWeight={700}
                              color="info.main"
                            >
                              -{formatCurrency(transaction.amount)}
                            </Typography>
                          </ListItem>
                        </Box>
                      )
                    )}
                  </>
                )}
              </List>
            )}
          </Box>
        </Box>
      </Modal>
    </DashboardCard>
  );
}
