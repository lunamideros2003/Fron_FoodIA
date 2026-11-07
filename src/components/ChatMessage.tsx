import { cn } from "../lib/cn.ts";
import {
  CHAT_OFF_TOPIC_LABEL,
  chatSourceLabel,
  type ChatMessage as ChatMessageModel,
} from "../lib/chat.ts";
import { ChefIcon, SparkIcon, WarningIcon } from "./icons.tsx";

interface ChatMessageProps {
  message: ChatMessageModel;
  onSuggestion?: (suggestion: string) => void;
}

/** One bubble of the conversation, with its suggestions when it has any. */
export function ChatMessage({ message, onSuggestion }: ChatMessageProps) {
  const fromUser = message.role === "user";
  const label = chatSourceLabel(message.source);

  return (
    <li className={cn("flex gap-3", fromUser ? "justify-end" : "justify-start")}>
      {!fromUser ? (
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-peach-100 text-clay-600">
          <ChefIcon className="h-4 w-4" />
        </span>
      ) : null}

      <div className={cn("min-w-0 max-w-[min(34rem,85%)]", fromUser && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            fromUser
              ? "rounded-br-md bg-clay-500 text-cream-50"
              : message.error
                ? "rounded-bl-md border border-clay-300 bg-peach-100 text-clay-600"
                : message.inScope === false
                  ? "rounded-bl-md border border-clay-300 bg-cream-100 text-ink-soft"
                  : "rounded-bl-md border border-line bg-surface text-ink-soft",
          )}
        >
          {!fromUser && message.inScope === false ? (
            <p className="mb-1.5 flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-clay-600">
              <WarningIcon className="h-3.5 w-3.5" />
              {CHAT_OFF_TOPIC_LABEL}
            </p>
          ) : null}

          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {!fromUser && label ? (
            <p className="mt-2 flex items-center gap-1 text-[0.62rem] font-medium text-muted">
              <SparkIcon className="h-3 w-3" />
              {label}
            </p>
          ) : null}
        </div>

        {!fromUser && message.suggestions && message.suggestions.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {message.suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => onSuggestion?.(suggestion)}
                  className="rounded-full border border-line bg-cream-50 px-3 py-1.5 text-left text-[0.7rem] font-medium text-ink-soft transition-colors hover:border-clay-300 hover:text-clay-600"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
