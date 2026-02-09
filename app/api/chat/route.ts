import { PROBLEM_SYSTEM_PROMPT } from "@/lib/prompts/problem";
import { HYPOTHESIS_CHAT_PROMPT } from "@/lib/prompts/hypothesis";
import { DESIGN_CHAT_PROMPT } from "@/lib/prompts/design";
import { PLAN_GENERATION_PROMPT } from "@/lib/prompts/plan";
import { ANALYSIS_PROMPT } from "@/lib/prompts/analysis";

export const runtime = "edge";
export const maxDuration = 60;

const LEVEL_PROMPTS: Record<string, string> = {
  problem: PROBLEM_SYSTEM_PROMPT,
  hypothesis: HYPOTHESIS_CHAT_PROMPT,
  design: DESIGN_CHAT_PROMPT,
  plan: PLAN_GENERATION_PROMPT,
  analysis: ANALYSIS_PROMPT,
};

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured. Please set ANTHROPIC_API_KEY in environment variables." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, level, context } = await request.json();

    const systemPrompt = LEVEL_PROMPTS[level] || PROBLEM_SYSTEM_PROMPT;
    const contextSuffix = context
      ? `\n\n## Current Experiment Context\n${context}`
      : "";

    // Direct fetch to Anthropic API — no SDK needed, works on edge/serverless
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        stream: true,
        system: systemPrompt + contextSuffix,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${anthropicRes.status}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pipe Anthropic's SSE stream, extracting text deltas
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = anthropicRes.body!.getReader();

    const readable = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (
                  parsed.type === "content_block_delta" &&
                  parsed.delta?.type === "text_delta"
                ) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                  );
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamError) {
          console.error("Stream error:", streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: `Chat failed: ${errorMessage}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
