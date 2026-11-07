import { useCallback, useState } from "react";
import { api } from "../lib/api.ts";
import {
  buildChatHistory,
  CHAT_ERROR,
  clampChatMessage,
  createMessageId,
  welcomeMessage,
  type ChatMessage,
} from "../lib/chat.ts";

export interface ChatState {
  messages: ChatMessage[];
  busy: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  reset: () => void;
}

/**
 * The conversation state.
 *
 * The backend owns the scope rules; this hook only keeps the bubbles, sends
 * the last turns as context and shows an honest error bubble when the request
 * fails. A failed turn never removes what the person already wrote.
 */
export function useChat(userId?: number): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const clean = clampChatMessage(text.trim());
      if (!clean || busy) return;

      const history = buildChatHistory(messages);
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: clean,
      };

      setMessages((current) => [...current, userMessage]);
      setBusy(true);
      setError(null);

      try {
        const answer = await api.chat({ message: clean, history, userId });
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(),
            role: "assistant",
            content: answer.answer,
            suggestions: answer.suggestions,
            inScope: answer.inScope,
            source: answer.source,
          },
        ]);
      } catch (cause) {
        const detail = cause instanceof Error ? cause.message : CHAT_ERROR;
        setError(detail);
        setMessages((current) => [
          ...current,
          {
            id: createMessageId(),
            role: "assistant",
            content: detail,
            error: true,
            inScope: true,
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, userId],
  );

  const reset = useCallback(() => {
    setMessages([welcomeMessage()]);
    setError(null);
    setBusy(false);
  }, []);

  return { messages, busy, error, send, reset };
}
