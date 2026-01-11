"use client";

import React from "react";
import { Box, Avatar, Paper, useTheme, alpha } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/data/assistant";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import { StructuredDataDisplay } from "./StructuredDataDisplay";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const theme = useTheme();
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
        animation: "slideIn 0.3s ease-out",
        "@keyframes slideIn": {
          from: {
            opacity: 0,
            transform: "translateY(10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          maxWidth: { xs: "95%", sm: "75%", md: "65%" },
          width: "100%",
          flexDirection: isUser ? "row-reverse" : "row",
          gap: 1.5,
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: isUser
              ? theme.palette.primary.main
              : theme.palette.grey[300],
            width: 36,
            height: 36,
            boxShadow: isUser
              ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
              : "none",
          }}
        >
          {isUser ? (
            <PersonIcon sx={{ fontSize: 20 }} />
          ) : (
            <SmartToyIcon
              sx={{ fontSize: 20, color: theme.palette.primary.main }}
            />
          )}
        </Avatar>

        {/* Message Bubble */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: "100%" }}>
          <Paper
            elevation={0}
            sx={{
              px: 2.5,
              py: 1.75,
              borderRadius: isUser
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              background: isUser
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : theme.palette.background.paper,
              color: isUser ? "#FFFFFF" : theme.palette.text.primary,
              boxShadow: isUser
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                : `0 2px 8px ${alpha(theme.palette.grey[500], 0.1)}`,
              border: isUser ? "none" : `1px solid ${theme.palette.divider}`,
            }}
          >
            {isUser ? (
              <Box sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {message.content}
              </Box>
            ) : (
              <Box
                sx={{
                  maxWidth: "100%",
                  overflow: "hidden",
                  wordBreak: "break-word",
                  "& *": {
                    maxWidth: "100%",
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  },
                  "& p": {
                    margin: 0,
                    mb: 1,
                    "&:last-child": { mb: 0 },
                    overflowWrap: "break-word",
                  },
                  "& ul, & ol": {
                    margin: 0,
                    pl: 2.5,
                    mb: 1,
                    overflowWrap: "break-word",
                  },
                  "& li": {
                    mb: 0.5,
                    overflowWrap: "break-word",
                  },
                  "& code": {
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: "0.875em",
                    fontFamily: "monospace",
                    overflowWrap: "break-word",
                    wordBreak: "break-all",
                  },
                  "& pre": {
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    p: 1.5,
                    borderRadius: 2,
                    overflow: "auto",
                    mb: 1,
                    maxWidth: "100%",
                  },
                  "& pre code": {
                    bgcolor: "transparent",
                    p: 0,
                    wordBreak: "break-all",
                  },
                  "& table": {
                    borderCollapse: "collapse",
                    width: "100%",
                    mb: 1,
                    display: "block",
                    overflowX: "auto",
                    maxWidth: "100%",
                  },
                  "& th, & td": {
                    border: `1px solid ${theme.palette.divider}`,
                    px: 1,
                    py: 0.5,
                    textAlign: "left",
                    overflowWrap: "break-word",
                  },
                  "& th": {
                    bgcolor: alpha(theme.palette.grey[500], 0.05),
                    fontWeight: 600,
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
