import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// One-time migration endpoint — add new columns safely
// GET /api/migrate  (call once after deploy)
export async function GET() {
  const secret = process.env.MIGRATION_SECRET;
  // If no secret configured, block in production
  if (!secret) {
    return NextResponse.json({ error: "MIGRATION_SECRET not configured" }, { status: 403 });
  }
  return NextResponse.json({ error: "Use POST with ?secret=..." }, { status: 405 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const envSecret = process.env.MIGRATION_SECRET;

  if (!envSecret || secret !== envSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();

    await sql`
      ALTER TABLE experiment_designs
      ADD COLUMN IF NOT EXISTS experiment_path VARCHAR(20)
    `;

    return NextResponse.json({ ok: true, message: "Migration complete: experiment_path column added" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
