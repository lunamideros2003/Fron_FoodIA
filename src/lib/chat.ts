import type { ChatSource, ChatTurn } from "../types.ts";

/**
 * The copy and small helpers of the general chatbot.
 *
 * The welcome is shown before the first question so the scope is clear from
 * the start: food, diets and how to use FoodMood IA. Anything else gets a
 * polite refusal from the backend and a distinct bubble here.
 */

export const CHAT_WELCOME =
  "¡Hola! Soy Chef, el asistente de FoodMood IA. Puedes preguntarme por recetas, " +
  "ingredientes, dietas o por cómo usar la app. No resuelvo sumas, tareas ni " +
  "preguntas de otros temas.";

export const CHAT_SCOPE_NOTE = "Comida · dietas · cómo usar la app";

export const CHAT_SCOPE_EXPLANATION =
  "Mi tema es la comida, las dietas y FoodMood IA. Si me preguntas algo de otro " +
  "tipo, te lo diré con claridad en vez de inventar una respuesta.";

export const CHAT_SUGGESTIONS = [
  "¿Qué puedo cocinar con lo que tengo en la nevera?",
  "¿Qué es una dieta equilibrada?",
  "¿Cómo guardo una receta en favoritos?",
  "¿Cómo armo un plan semanal?",
];

export const CHAT_OFF_TOPIC_LABEL = "Fuera de mi tema";

export const CHAT_ERROR =
  "No pude conectar con el asistente. Revisa tu conexión e inténtalo otra vez.";

/** The maximum the backend accepts; the composer stops here. */
export const CHAT_MAX_LENGTH = 600;

/** The initial assistant bubble, before the person types anything. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  /** False only for the polite refusal of an unrelated question. */
  inScope?: boolean;
  source?: ChatSource;
  /** A local error bubble, not an answer from the backend. */
  error?: boolean;
}

let messageCounter = 0;

/** A stable-enough id for React keys; no crypto needed in old browsers. */
export function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now().toString(36)}-${messageCounter}`;
}

export function welcomeMessage(): ChatMessage {
  return {
    id: createMessageId(),
    role: "assistant",
    content: CHAT_WELCOME,
    suggestions: CHAT_SUGGESTIONS,
    inScope: true,
  };
}

/**
 * The history sent to the backend: the last few real turns, without the local
 * welcome or error bubbles, which the model does not need to see again.
 */
export function buildChatHistory(messages: ChatMessage[], maxTurns = 8): ChatTurn[] {
  return messages
    .filter((message) => !message.error && message.content.trim().length > 0)
    .slice(-maxTurns)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 500),
    }));
}

/** Keeps the composer and the request inside the backend limit. */
export function clampChatMessage(value: string, limit = CHAT_MAX_LENGTH): string {
  return value.slice(0, limit);
}

export function canSendChatMessage(value: string, busy: boolean): boolean {
  return !busy && value.trim().length > 0;
}

/** Short, honest labels for where an answer came from. */
export function chatSourceLabel(source: ChatSource | undefined): string {
  switch (source) {
    case "llm":
      return "IA";
    case "llm-fallback":
      return "IA · respaldo local";
    case "local-model":
      return "Respuesta local";
    default:
      return "";
  }
}
