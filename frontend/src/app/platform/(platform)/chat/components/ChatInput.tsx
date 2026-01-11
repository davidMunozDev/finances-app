"use client";

import React, { useState, KeyboardEvent } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = 1000;

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const theme = useTheme();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && trimmed.length <= MAX_LENGTH && !disabled) {
      onSend(trimmed);
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isValid = message.trim().length > 0 && message.length <= MAX_LENGTH;

  return (
    <Paper
      elevation={0}
      sx={{
        borderTop: `1px solid ${theme.palette.divider}`,
        p: { xs: 2, sm: 2.5, md: 3 },
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Escribe tu pregunta aquí..."
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: theme.palette.background.default,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
                "&.Mui-focused": {
                  bgcolor: theme.palette.background.paper,
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )}`,
                },
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 0.5,
              px: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color:
                  message.length > MAX_LENGTH
                    ? theme.palette.error.main
                    : theme.palette.text.secondary,
              }}
            >
              {message.length}/{MAX_LENGTH} caracteres
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleSend}
          disabled={!isValid || disabled}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "#FFFFFF",
            width: 48,
            height: 48,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: "translateY(-2px)",
            },
            "&:disabled": {
              bgcolor: theme.palette.grey[300],
              color: theme.palette.grey[500],
              boxShadow: "none",
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
