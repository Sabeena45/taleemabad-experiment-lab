import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/experiments — list all experiments
export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, title, created_by, experiment_path, current_level, status, experiment_type,
             problem_approved, hypothesis_approved, design_approved, plan_approved,
             collection_complete, report_approved, created_at, updated_at
      FROM experiment_designs
      ORDER BY updated_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to list experiments:", error);
    return NextResponse.json({ error: "Failed to list experiments" }, { status: 500 });
  }
}

// POST /api/experiments — create new experiment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sql = getDb();
    const rows = await sql`
      INSERT INTO experiment_designs (title, created_by, experiment_path)
      VALUES (${body.title || "Untitled Experiment"}, ${body.created_by || "anonymous"}, ${body.experiment_path || null})
      RETURNING id, title, created_by, experiment_path, current_level, status, created_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create experiment:", error);
    return NextResponse.json({ error: "Failed to create experiment" }, { status: 500 });
  }
}
