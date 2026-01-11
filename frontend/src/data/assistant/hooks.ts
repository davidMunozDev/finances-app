import { useState, useCallback } from "react";
import { sendAssistantQuery } from "./api";
import type { ChatMessage, AssistantQueryRequest } from "./types";

const MAX_MESSAGES = 50;

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (question: string, budgetId?: number) => {
      if (!question.trim() || question.length > 1000) {
        return;
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, userMessage];
        return updated.slice(-MAX_MESSAGES);
      });

      setIsLoading(true);
      setError(null);

      try {
        const request: AssistantQueryRequest = {
          question,
          ...(budgetId && { budgetId }),
        };

        const response = await sendAssistantQuery(request);

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          data: response.data,
          timestamp: new Date(),
        };

        setMessages((prev) => {
          const updated = [...prev, assistantMessage];
          return updated.slice(-MAX_MESSAGES);
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
