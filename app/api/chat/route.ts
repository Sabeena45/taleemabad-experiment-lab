import { PROBLEM_SYSTEM_PROMPT } from "@/lib/prompts/problem";
import { HYPOTHESIS_CHAT_PROMPT } from "@/lib/prompts/hypothesis";
import { DESIGN_CHAT_PROMPT } from "@/lib/prompts/design";
import Anthropic from "@anthropic-ai/sdk";

const LEVEL_PROMPTS: Record<string, string> = {
  problem: PROBLEM_SYSTEM_PROMPT,
  hypothesis: HYPOTHESIS_CHAT_PROMPT,
  design: DESIGN_CHAT_PROMPT,
};

export async function POST(request: Request) {
  try {
    const { messages, level, context } = await request.json();

    const systemPrompt = LEVEL_PROMPTS[level] || PROBLEM_SYSTEM_PROMPT;
    const contextSuffix = context
      ? `\n\n## Current Experiment Context\n${context}`
      : "";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
