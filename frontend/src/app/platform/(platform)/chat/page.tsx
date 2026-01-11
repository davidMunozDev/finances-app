"use client";

import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { BudgetSelector } from "@/components";
import { useBudget } from "@/budget/BudgetProvider";
import { useAssistantChat } from "@/data/assistant";
import { ChatMessageList, ChatInput } from "./components";

export default function ChatPage() {
  const theme = useTheme();
  const { currentBudget } = useBudget();
  const { messages, isLoading, error, sendMessage, clearChat } =
    useAssistantChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message, currentBudget?.id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        height: {
          xs: "calc(100vh - 110px - 72px)", // Mobile: minus header & footer
          md: "calc(100vh - 72px - 64px)", // Desktop: minus header & padding
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: { xs: "100%", md: "1000px", lg: "1000px" },
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Error Display */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              mx: { xs: 2, sm: 3, md: 4 },
              mt: 2,
              p: 2,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${theme.palette.error.main}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="error.main">
              <strong>Error:</strong> {error.message}
            </Typography>
          </Paper>
        )}

        {/* Messages Area */}
        <ChatMessageList messages={messages} isLoading={isLoading} />

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </Box>
    </Box>
  );
}
