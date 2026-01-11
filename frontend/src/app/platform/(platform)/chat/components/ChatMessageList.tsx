"use client";

import React, { useEffect, useRef } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import type { ChatMessage } from "@/data/assistant";
import { ChatMessageBubble } from "./ChatMessageBubble";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        py: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 && !isLoading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            textAlign: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ¡Hola! 👋
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 500 }}
          >
            Soy tu asistente financiero inteligente. Puedo ayudarte a analizar
            tus gastos, ingresos y presupuestos. ¿En qué puedo ayudarte hoy?
          </Typography>
        </Box>
      )}

      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              px: 2,
              py: 1.5,
              borderRadius: "16px 16px 16px 4px",
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.primary.main,
                  animation: "bounce 1.4s infinite",
                  animationDelay: `${i * 0.2}s`,
                  "@keyframes bounce": {
                    "0%, 60%, 100%": {
                      transform: "translateY(0)",
                    },
                    "30%": {
                      transform: "translateY(-8px)",
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </Box>
  );
}
