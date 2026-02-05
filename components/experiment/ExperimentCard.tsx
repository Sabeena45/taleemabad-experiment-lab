"use client";

import Link from "next/link";
import { LEVELS } from "@/lib/db";
import { Clock, ArrowRight } from "lucide-react";

interface Props {
  experiment: {
    id: string;
    title: string | null;
    current_level: number;
    status: string;
    experiment_type: string | null;
    created_at: string;
    updated_at: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  draft: "badge-gray",
  in_progress: "badge-info",
  plan_complete: "badge-success",
  collecting_data: "badge-warning",
  analyzing: "badge-info",
  complete: "badge-success",
};

export default function ExperimentCard({ experiment }: Props) {
  const level = LEVELS[experiment.current_level - 1];
  const progress = ((experiment.current_level - 1) / LEVELS.length) * 100;

  return (
    <Link href={`/experiment/${experiment.id}`} className="card-hover block group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display font-semibold text-text-primary group-hover:text-primary transition-colors">
          {experiment.title || "Untitled Experiment"}
        </h3>
        <span className={STATUS_COLORS[experiment.status] || "badge-gray"}>
          {experiment.status.replace(/_/g, " ")}
        </span>
      </div>

      {experiment.experiment_type && (
        <p className="text-sm text-text-secondary mb-3 capitalize">
          {experiment.experiment_type.replace(/_/g, " ")}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
          <span>
            {level?.icon} Level {experiment.current_level}: {level?.title}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(experiment.updated_at).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Continue <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
