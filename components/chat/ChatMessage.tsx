"use client";

import { FlaskConical, User } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: Props) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={clsx(
        "flex gap-3 max-w-3xl",
        isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isAssistant ? "bg-primary" : "bg-gray-200"
        )}
      >
        {isAssistant ? (
          <FlaskConical className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-text-secondary" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={clsx(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-lg",
          isAssistant
            ? "bg-gray-50 text-text-primary"
            : "bg-primary text-white",
          isStreaming && "animate-pulse-slow"
        )}
      >
        {/* Render markdown-like formatting */}
        <div className="whitespace-pre-wrap break-words">
          {content.split("\n").map((line, i) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold mt-2 first:mt-0">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            return <p key={i} className={line ? "mt-1 first:mt-0" : "mt-2"}>{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
