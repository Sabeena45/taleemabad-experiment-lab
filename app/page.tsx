"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ExperimentCard from "@/components/experiment/ExperimentCard";
import { Plus, FlaskConical, Sparkles } from "lucide-react";

interface ExperimentSummary {
  id: string;
  title: string | null;
  current_level: number;
  status: string;
  experiment_type: string | null;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchExperiments();
  }, []);

  async function fetchExperiments() {
    try {
      const res = await fetch("/api/experiments");
      if (res.ok) {
        const data = await res.json();
        setExperiments(data);
      }
    } catch (error) {
      console.error("Failed to fetch experiments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createExperiment() {
    setCreating(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Experiment" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/experiment/${data.id}/problem`);
      }
    } catch (error) {
      console.error("Failed to create experiment:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 badge-info mb-4">
            <Sparkles className="w-3 h-3" />
            Guided experiment design
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">
            Experiment Lab
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Design rigorous experiments step by step — from problem statement to
            analysis report. AI-guided, gamified, and fun.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <button
            onClick={createExperiment}
            disabled={creating}
            className="btn-primary text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            {creating ? "Creating..." : "Start New Experiment"}
          </button>
        </div>

        {/* Experiments Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : experiments.length > 0 ? (
          <div>
            <h2 className="section-title mb-4">
              Your Experiments ({experiments.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {experiments.map((exp) => (
                <ExperimentCard key={exp.id} experiment={exp} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 card">
            <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-text-primary mb-2">
              No experiments yet
            </h3>
            <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
              Start your first experiment and we&apos;ll guide you through every
              step — from defining your problem to analyzing results.
            </p>
            <button onClick={createExperiment} disabled={creating} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create your first experiment
            </button>
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 pt-12 border-t border-gray-100">
          <h2 className="section-title text-center mb-8">
            6 Levels to a Rigorous Experiment
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "🎯", title: "Problem Statement", desc: "Define what you're investigating" },
              { icon: "💡", title: "Hypothesis", desc: "Generate testable predictions" },
              { icon: "🔬", title: "Study Design", desc: "Choose method & calculate sample size" },
              { icon: "📋", title: "Study Plan", desc: "Create your pre-analysis plan" },
              { icon: "📊", title: "Data Collection", desc: "Collect and upload your data" },
              { icon: "📈", title: "Analysis & Report", desc: "Run analysis & generate your report" },
            ].map((step, i) => (
              <div key={i} className="card text-center">
                <div className="text-3xl mb-2">{step.icon}</div>
                <p className="font-display font-semibold text-sm text-text-primary mb-1">
                  Level {i + 1}: {step.title}
                </p>
                <p className="text-xs text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
