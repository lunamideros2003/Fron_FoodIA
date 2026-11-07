import { useRef, type FormEvent, type KeyboardEvent } from "react";
import { canSendChatMessage, CHAT_MAX_LENGTH, clampChatMessage } from "../lib/chat.ts";
import { ArrowIcon } from "./icons.tsx";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
}

/** The text box of the chat: Enter sends, Shift+Enter adds a line. */
export function ChatComposer({ value, onChange, onSubmit, busy }: ChatComposerProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const canSend = canSendChatMessage(value, busy);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    onSubmit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    if (!canSend) return;
    onSubmit();
  };

  return (
    <form
      onSubmit={submit}
      className="border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-5"
    >
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="chat-message">
          Tu mensaje para Chef
        </label>
        <textarea
          id="chat-message"
          ref={textarea}
          rows={2}
          value={value}
          maxLength={CHAT_MAX_LENGTH}
          onChange={(event) => onChange(clampChatMessage(event.target.value))}
          onKeyDown={onKeyDown}
          placeholder="Pregúntame por comida, dietas o por la app…"
          className="fm-input min-h-[3.25rem] flex-1 resize-none !py-2.5 text-sm"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="fm-button fm-button-primary !h-[3.25rem] !w-[3.25rem] !rounded-xl !px-0"
          aria-label="Enviar mensaje"
        >
          <ArrowIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-3 text-[0.65rem] text-muted">
        <span>Enter envía · Shift+Enter hace un salto de línea</span>
        <span className={value.length >= CHAT_MAX_LENGTH ? "font-semibold text-clay-600" : ""}>
          {value.length}/{CHAT_MAX_LENGTH}
        </span>
      </div>
    </form>
  );
}
