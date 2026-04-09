"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatInterface from "@/components/chat/ChatInterface";
import ApprovalCard from "@/components/experiment/ApprovalCard";
import CelebrationOverlay from "@/components/experiment/CelebrationOverlay";
import type { ExperimentDesign, ChatMessage } from "@/lib/db";

export default function ProblemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((exp: ExperimentDesign) => {
        setExperiment(exp);
        if (exp.conversations?.problem) {
          setMessages(exp.conversations.problem);
        }
      });
  }, [id]);

  async function saveMessages(msgs: ChatMessage[]) {
    const convos = experiment?.conversations || {};
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversations: { ...convos, problem: msgs } }),
    });
  }

  async function handleSend(userMessage: string) {
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage, timestamp: new Date().toISOString() },
    ];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent("");
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          level: "problem",
          context: experiment?.problem_statement
            ? `Current problem statement: ${experiment.problem_statement}`
            : "",
          experiment_path: experiment?.experiment_path,
        }),
      });

      clearTimeout(timeout);

      // Check for non-streaming error response
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || `Request failed with status ${res.status}`);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setError(parsed.error);
                break;
              }
              if (parsed.text) {
                fullContent += parsed.text;
                setStreamingContent(fullContent);
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }

      if (!fullContent) {
        setError("No response received. Please check that the API key is configured.");
        setIsStreaming(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fullContent,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      await saveMessages(updatedMessages);

      // Check if the response contains a problem statement
      if (fullContent.includes("**PROBLEM STATEMENT**") || fullContent.includes("**Problem:**")) {
        await fetch(`/api/experiments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem_statement: fullContent }),
        });
        setExperiment((prev) =>
          prev ? { ...prev, problem_statement: fullContent } : prev
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. The AI service may be slow — please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }

  async function handleApprove() {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problem_approved: true,
        current_level: 2,
        status: "in_progress",
      }),
    });
    setShowCelebration(true);
  }

  async function handleEdit(newContent: string) {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem_statement: newContent }),
    });
    setExperiment((prev) =>
      prev ? { ...prev, problem_statement: newContent } : prev
    );
  }

  function handleRegenerate() {
    handleSend("Please regenerate the problem statement with a different angle.");
  }

  const handleDismissCelebration = useCallback(() => {
    setShowCelebration(false);
    router.push(`/experiment/${id}/hypothesis`);
  }, [router, id]);

  if (!experiment) return null;

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎯</span>
        <div>
          <h2 className="font-display font-bold text-lg">Level 1: Problem Statement</h2>
          <p className="text-sm text-text-secondary">
            Tell me about the problem you want to investigate
          </p>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100%-4rem)] rounded-2xl border border-gray-100 bg-surface overflow-hidden">
        {experiment.problem_statement && !experiment.problem_approved ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Show chat history */}
              <div className="space-y-4 mb-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className={`inline-block rounded-2xl px-4 py-2 max-w-lg ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-gray-50"
                      }`}
                    >
                      {msg.content.substring(0, 200)}
                      {msg.content.length > 200 && "..."}
                    </span>
                  </div>
                ))}
              </div>

              <ApprovalCard
                title="Your Problem Statement"
                content={experiment.problem_statement}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onRegenerate={handleRegenerate}
              />
            </div>
          </div>
        ) : experiment.problem_approved ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-display font-bold text-lg mb-1">Problem Statement Approved</h3>
              <p className="text-sm text-text-secondary mb-4">Move on to generate hypotheses.</p>
              <button
                onClick={() => router.push(`/experiment/${id}/hypothesis`)}
                className="btn-primary"
              >
                Go to Level 2: Hypothesis →
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-red-500">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            <ChatInterface
              messages={messages}
              onSend={handleSend}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
              placeholder="Describe the problem you want to investigate..."
              level="problem"
            />
          </>
        )}
      </div>

      <CelebrationOverlay
        show={showCelebration}
        levelTitle="Problem Statement"
        onDismiss={handleDismissCelebration}
      />
    </div>
  );
}
