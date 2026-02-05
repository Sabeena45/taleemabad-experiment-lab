import { getDb } from "@/lib/db";
import { generateJSON } from "@/lib/claude";
import { DESIGN_RECOMMENDATION_PROMPT } from "@/lib/prompts/design";

interface DesignRecommendation {
  recommended_type: string;
  confidence: string;
  reasoning: string;
  alternatives: { type: string; why_not: string }[];
  suggested_arms: { name: string; description: string; allocation_pct: number }[];
  suggested_outcomes: { primary: string; secondary: string[] };
  design_considerations: string[];
}

export async function POST(request: Request) {
  try {
    const { experimentId } = await request.json();

    if (!experimentId) {
      return Response.json({ error: "experimentId is required" }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql(
      "SELECT problem_statement, problem_context, hypotheses, theory_of_change FROM experiment_designs WHERE id = $1",
      [experimentId]
    );

    if (!rows.length) {
      return Response.json({ error: "Experiment not found" }, { status: 404 });
    }

    const exp = rows[0];

    if (!exp.problem_statement) {
      return Response.json({ error: "No problem statement yet" }, { status: 400 });
    }

    // Build context for Claude
    const hypothesesText = exp.hypotheses
      ? JSON.parse(typeof exp.hypotheses === "string" ? exp.hypotheses : JSON.stringify(exp.hypotheses))
          .map((h: { text: string; isPrimary?: boolean }) =>
            `${h.isPrimary ? "[PRIMARY] " : ""}${h.text}`
          )
          .join("\n")
      : "No hypotheses defined yet.";

    const userMessage = `## Problem Statement
${exp.problem_statement}

## Additional Context
${exp.problem_context ? JSON.stringify(exp.problem_context) : "None"}

## Hypotheses
${hypothesesText}

## Theory of Change
${exp.theory_of_change || "Not defined yet."}

Based on this information, recommend the best experiment type and design.`;

    const recommendation = await generateJSON<DesignRecommendation>(
      DESIGN_RECOMMENDATION_PROMPT,
      userMessage
    );

    return Response.json(recommendation);
  } catch (error) {
    console.error("Recommend type error:", error);
    return Response.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
