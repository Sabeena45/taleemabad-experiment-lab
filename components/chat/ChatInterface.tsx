"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import VoiceInput from "./VoiceInput";
import { Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  onSend: (message: string) => void;
  isStreaming: boolean;
  streamingContent: string;
  placeholder?: string;
  level: string;
}

export default function ChatInterface({
  messages,
  onSend,
  isStreaming,
  streamingContent,
  placeholder = "Describe your problem...",
  level,
}: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleVoiceResult(text: string) {
    onSend(text);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">
              {level === "problem" ? "🎯" : level === "hypothesis" ? "💡" : "🔬"}
            </p>
            <p className="text-text-secondary text-sm">
              {level === "problem"
                ? "Tell me about the problem you want to investigate. You can type or use voice."
                : level === "hypothesis"
                ? "Let's turn your problem into testable hypotheses."
                : "Let's refine your study design."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isStreaming && streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-center gap-2 text-text-secondary text-sm px-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-4 bg-surface">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <VoiceInput onResult={handleVoiceResult} disabled={isStreaming} />

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isStreaming}
              rows={1}
              className="input-field resize-none pr-12 min-h-[48px] max-h-32"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="btn-primary px-3 py-3 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
