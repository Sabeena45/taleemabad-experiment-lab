import { PROBLEM_SYSTEM_PROMPT } from "@/lib/prompts/problem";
import { HYPOTHESIS_CHAT_PROMPT } from "@/lib/prompts/hypothesis";
import { DESIGN_CHAT_PROMPT } from "@/lib/prompts/design";
import { PLAN_GENERATION_PROMPT } from "@/lib/prompts/plan";
import { ANALYSIS_PROMPT } from "@/lib/prompts/analysis";
import Anthropic from "@anthropic-ai/sdk";

const LEVEL_PROMPTS: Record<string, string> = {
  problem: PROBLEM_SYSTEM_PROMPT,
  hypothesis: HYPOTHESIS_CHAT_PROMPT,
  design: DESIGN_CHAT_PROMPT,
  plan: PLAN_GENERATION_PROMPT,
  analysis: ANALYSIS_PROMPT,
};

export async function POST(request: Request) {
  // Check for API key first
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
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

    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: systemPrompt + contextSuffix,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Convert to ReadableStream for streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
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
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
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
