import assert from "node:assert/strict";
import test from "node:test";
import {
  buildChatHistory,
  canSendChatMessage,
  CHAT_MAX_LENGTH,
  CHAT_SUGGESTIONS,
  CHAT_WELCOME,
  chatSourceLabel,
  clampChatMessage,
  welcomeMessage,
  type ChatMessage,
} from "../src/lib/chat.ts";

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "test",
    role: "user",
    content: "¿Qué cocino hoy?",
    ...overrides,
  };
}

test("the welcome states the scope before the first question", () => {
  assert.match(CHAT_WELCOME, /recetas, ingredientes, dietas/);
  assert.match(CHAT_WELCOME, /No resuelvo sumas, tareas/);
  assert.equal(welcomeMessage().role, "assistant");
  assert.deepEqual(welcomeMessage().suggestions, CHAT_SUGGESTIONS);
});

test("the history leaves out the welcome and local error bubbles", () => {
  const history = buildChatHistory([
    welcomeMessage(),
    message({ role: "user", content: "Hola" }),
    message({ role: "assistant", content: "¿En qué te ayudo?" }),
    message({ role: "assistant", content: "Falló la conexión", error: true }),
  ]);

  assert.deepEqual(history, [
    { role: "user", content: "Hola" },
    { role: "assistant", content: "¿En qué te ayudo?" },
  ]);
});

test("the history keeps only the most recent turns", () => {
  const turns = Array.from({ length: 12 }, (_, index) =>
    message({ role: index % 2 === 0 ? "user" : "assistant", content: `turno ${index}` }),
  );

  const history = buildChatHistory(turns, 4);

  assert.equal(history.length, 4);
  assert.equal(history[0].content, "turno 8");
  assert.equal(history[3].content, "turno 11");
});

test("a long turn is trimmed before sending it", () => {
  const history = buildChatHistory([message({ content: "a".repeat(900) })]);

  assert.equal(history[0].content.length, 500);
});

test("the composer respects the backend limit", () => {
  const long = "b".repeat(CHAT_MAX_LENGTH + 50);

  assert.equal(clampChatMessage(long).length, CHAT_MAX_LENGTH);
  assert.equal(canSendChatMessage("  ", false), false);
  assert.equal(canSendChatMessage("hola", false), true);
  assert.equal(canSendChatMessage("hola", true), false);
});

test("the source labels distinguish the model from the local fallback", () => {
  assert.equal(chatSourceLabel("llm"), "IA");
  assert.equal(chatSourceLabel("llm-fallback"), "IA · respaldo local");
  assert.equal(chatSourceLabel("local-model"), "Respuesta local");
  assert.equal(chatSourceLabel(undefined), "");
});
