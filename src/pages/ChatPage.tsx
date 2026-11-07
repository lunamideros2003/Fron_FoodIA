import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader.tsx";
import { ChatComposer } from "../components/ChatComposer.tsx";
import { ChatMessage } from "../components/ChatMessage.tsx";
import { useChat } from "../hooks/useChat.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useUser } from "../context/UserContext.tsx";
import { CHAT_SCOPE_EXPLANATION, CHAT_SCOPE_NOTE } from "../lib/chat.ts";
import { ChefIcon, SparkIcon } from "../components/icons.tsx";

/** The general chat: food, diets and how to use FoodMood IA. */
export function ChatPage() {
  useDocumentTitle("Chat con IA");
  const { user } = useUser();
  const { messages, busy, send, reset } = useChat(user?.id);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, busy]);

  const submit = () => {
    const text = draft;
    setDraft("");
    void send(text);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      <PageHeader
        eyebrow="Chat con IA"
        title="Chef, tu asistente de comida"
        description="Pregúntame por recetas, ingredientes, dietas o por cómo usar FoodMood IA. Estoy para eso."
        actions={
          <button type="button" onClick={reset} className="fm-button fm-button-ghost !py-2 text-xs">
            Empezar de nuevo
          </button>
        }
      />

      <section
        aria-label="Conversación con Chef"
        className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-line bg-cream-50 shadow-soft"
      >
        <div className="flex items-start gap-2.5 border-b border-line bg-surface px-4 py-3 sm:px-5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach-100 text-clay-600">
            <SparkIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-clay-600">
              {CHAT_SCOPE_NOTE}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">{CHAT_SCOPE_EXPLANATION}</p>
          </div>
        </div>

        <ol
          aria-live="polite"
          aria-busy={busy}
          className="min-h-[46vh] max-h-[62vh] flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onSuggestion={(suggestion) => void send(suggestion)}
            />
          ))}

          {busy ? (
            <li className="flex gap-3" aria-label="Chef está escribiendo">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach-100 text-clay-600">
                <ChefIcon className="h-4 w-4" />
              </span>
              <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay-400 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay-400 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay-400" />
              </span>
            </li>
          ) : null}

          <div ref={endRef} />
        </ol>

        <ChatComposer value={draft} onChange={setDraft} onSubmit={submit} busy={busy} />
      </section>

      <p className="mt-3 px-1 text-center text-[0.68rem] leading-relaxed text-muted">
        Chef no da diagnósticos ni consejos médicos. Si tienes una condición de salud, consulta a
        un profesional.
      </p>
    </div>
  );
}
