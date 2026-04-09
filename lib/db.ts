import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return neon(databaseUrl);
}

// Type definitions for experiment_designs table
export type ExperimentPath = "product" | "impact";

export interface ExperimentDesign {
  id: string;
  title: string | null;
  created_by: string | null;
  experiment_path: ExperimentPath | null;
  current_level: number;
  status: "draft" | "in_progress" | "plan_complete" | "collecting_data" | "analyzing" | "complete";

  // Level 1
  problem_voice_url: string | null;
  problem_transcript: string | null;
  problem_statement: string | null;
  problem_context: Record<string, unknown> | null;
  problem_approved: boolean;

  // Level 2
  hypotheses: Hypothesis[] | null;
  theory_of_change: string | null;
  hypothesis_approved: boolean;

  // Level 3
  experiment_type: string | null;
  population_description: string | null;
  population_size: number | null;
  cluster_unit: string | null;
  cluster_size: number | null;
  num_clusters: number | null;
  icc: number | null;
  mde: number | null;
  power_level: number;
  significance_level: number;
  calculated_sample_size: number | null;
  attrition_rate: number;
  adjusted_sample_size: number | null;
  intervention_arms: InterventionArm[] | null;
  primary_outcome: string | null;
  secondary_outcomes: string[] | null;
  design_approved: boolean;

  // Level 4
  study_plan: Record<string, unknown> | null;
  timeline: TimelinePhase[] | null;
  data_collection_methods: DataCollectionMethod[] | null;
  analysis_plan: string | null;
  plan_approved: boolean;
  plan_pdf_url: string | null;

  // Level 5
  data_format_guidance: string | null;
  collection_deadline: string | null;
  data_uploads: DataUpload[] | null;
  collection_complete: boolean;

  // Level 6
  analysis_results: Record<string, unknown> | null;
  report_content: Record<string, unknown> | null;
  charts: Record<string, unknown> | null;
  report_approved: boolean;
  report_pdf_url: string | null;

  conversations: Record<string, ChatMessage[]>;
  ops_experiment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  text: string;
  isPrimary: boolean;
  approved: boolean;
}

export interface InterventionArm {
  name: string;
  description: string;
  allocation_pct: number;
}

export interface TimelinePhase {
  phase: string;
  start: string;
  end: string;
  description: string;
}

export interface DataCollectionMethod {
  method: string;
  instrument: string;
  timing: string;
}

export interface DataUpload {
  filename: string;
  url: string;
  uploaded_at: string;
  type: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Level metadata
export const LEVELS = [
  { number: 1, key: "problem", title: "Problem Statement", icon: "🎯", path: "problem" },
  { number: 2, key: "hypothesis", title: "Hypothesis", icon: "💡", path: "hypothesis" },
  { number: 3, key: "design", title: "Study Design", icon: "🔬", path: "design" },
  { number: 4, key: "plan", title: "Study Plan", icon: "📋", path: "plan" },
  { number: 5, key: "data", title: "Data Collection", icon: "📊", path: "data" },
  { number: 6, key: "analysis", title: "Analysis & Report", icon: "📈", path: "analysis" },
] as const;
