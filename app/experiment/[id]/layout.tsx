"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import LevelSidebar from "@/components/experiment/LevelSidebar";
import type { ExperimentDesign } from "@/lib/db";

export default function ExperimentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((res) => res.json())
      .then(setExperiment)
      .catch(console.error);
  }, [id]);

  if (!experiment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Experiment title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {experiment.title || "Untitled Experiment"}
          </h1>
        </div>

        <div className="flex gap-8">
          <LevelSidebar
            experimentId={id}
            currentLevel={experiment.current_level}
            approvals={{
              problem_approved: experiment.problem_approved,
              hypothesis_approved: experiment.hypothesis_approved,
              design_approved: experiment.design_approved,
              plan_approved: experiment.plan_approved,
              collection_complete: experiment.collection_complete,
              report_approved: experiment.report_approved,
            }}
          />

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
