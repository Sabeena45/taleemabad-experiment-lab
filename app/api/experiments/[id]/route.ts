import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/experiments/[id]
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM experiment_designs WHERE id = ${params.id}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Failed to get experiment:", error);
    return NextResponse.json({ error: "Failed to get experiment" }, { status: 500 });
  }
}

// PATCH /api/experiments/[id] — update any fields
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const sql = getDb();

    // Build dynamic update — only update fields that are provided
    const updates: string[] = [];
    const values: unknown[] = [];

    const allowedFields = [
      "title", "current_level", "status", "experiment_path",
      "problem_voice_url", "problem_transcript", "problem_statement",
      "problem_context", "problem_approved",
      "hypotheses", "theory_of_change", "hypothesis_approved",
      "experiment_type", "population_description", "population_size",
      "cluster_unit", "cluster_size", "num_clusters", "icc", "mde",
      "power_level", "significance_level", "calculated_sample_size",
      "attrition_rate", "adjusted_sample_size", "intervention_arms",
      "primary_outcome", "secondary_outcomes", "design_approved",
      "study_plan", "timeline", "data_collection_methods", "analysis_plan",
      "plan_approved", "plan_pdf_url",
      "data_format_guidance", "collection_deadline", "data_uploads",
      "collection_complete",
      "analysis_results", "report_content", "charts", "report_approved",
      "report_pdf_url", "conversations",
    ];

    // Fields stored as JSONB in PostgreSQL — must be serialized to JSON strings
    const jsonbFields = new Set([
      "problem_context", "hypotheses", "intervention_arms", "secondary_outcomes",
      "study_plan", "timeline", "data_collection_methods", "data_uploads",
      "analysis_results", "report_content", "charts", "conversations",
    ]);

    for (const field of allowedFields) {
      if (field in body) {
        updates.push(field);
        const value = body[field];
        values.push(jsonbFields.has(field) && value !== null ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Use a simpler approach: serialize the update as JSON and let the DB handle it
    // Since Neon's tagged template doesn't support dynamic column names easily,
    // we'll do individual field updates
    const setClauses = updates
      .map((field, i) => jsonbFields.has(field) ? `${field} = $${i + 2}::jsonb` : `${field} = $${i + 2}`)
      .join(", ");

    const query = `
      UPDATE experiment_designs
      SET ${setClauses}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    // neon() supports sql(queryString, paramsArray) syntax for dynamic queries
    const result = await sql(query, [params.id, ...values]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to update experiment:", error);
    return NextResponse.json({ error: "Failed to update experiment" }, { status: 500 });
  }
}

// DELETE /api/experiments/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM experiment_designs WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete experiment:", error);
    return NextResponse.json({ error: "Failed to delete experiment" }, { status: 500 });
  }
}
