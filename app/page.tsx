"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ExperimentCard from "@/components/experiment/ExperimentCard";
import { FlaskConical, Zap, BarChart3, ArrowRight } from "lucide-react";

interface ExperimentSummary {
  id: string;
  title: string | null;
  experiment_path: "product" | "impact" | null;
  current_level: number;
  status: string;
  experiment_type: string | null;
  created_at: string;
  updated_at: string;
}

const PATHS = [
  {
    key: "product" as const,
    icon: Zap,
    title: "Product Testing",
    tagline: "Does this feature change behaviour?",
    description:
      "A/B test a product change — a new coaching prompt, a different nudge, a UI redesign. Fast iteration, digital data, results in days or weeks.",
    examples: ["New lesson plan format", "WhatsApp nudge timing", "Coaching prompt redesign"],
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200 hover:border-violet-400",
    badge: "bg-violet-100 text-violet-700",
    iconBg: "bg-violet-100 text-violet-600",
    btn: "bg-violet-600 hover:bg-violet-700 text-white",
  },
  {
    key: "impact" as const,
    icon: BarChart3,
    title: "Impact Testing",
    tagline: "Does this intervention improve outcomes?",
    description:
      "Design a rigorous field study — RCT, cluster trial, or quasi-experiment. Measure teacher behaviour or student learning. Results funders and policymakers trust.",
    examples: ["AI coaching → TEACH scores", "FLN programme → Grade 3 reading", "Cluster RCT across schools"],
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-50",
    border: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<"product" | "impact" | null>(null);

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

  async function createExperiment(path: "product" | "impact") {
    setCreating(path);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: path === "product" ? "New Product Test" : "New Impact Study",
          experiment_path: path,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/experiment/${data.id}/problem`);
      }
    } catch (error) {
      console.error("Failed to create experiment:", error);
    } finally {
      setCreating(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">
            Experiment Lab
          </h1>
          <p className="text-lg text-text-secondary max-w-lg mx-auto">
            What are you trying to learn?
          </p>
        </div>

        {/* Path cards */}
        <div className="grid gap-6 sm:grid-cols-2 mb-16">
          {PATHS.map((path) => {
            const Icon = path.icon;
            const isCreating = creating === path.key;
            return (
              <button
                key={path.key}
                onClick={() => createExperiment(path.key)}
                disabled={creating !== null}
                className={`text-left rounded-2xl border-2 p-7 transition-all duration-200 ${path.bg} ${path.border} group disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-3 rounded-xl ${path.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 mt-1" />
                </div>

                <h2 className="text-xl font-display font-bold text-text-primary mb-1">
                  {path.title}
                </h2>
                <p className="text-sm font-medium text-text-secondary mb-3 italic">
                  {path.tagline}
                </p>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">
                  {path.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  {path.examples.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${path.badge}`}>
                        eg
                      </span>
                      <span className="text-xs text-text-secondary">{ex}</span>
                    </div>
                  ))}
                </div>

                <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${path.btn}`}>
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Start {path.title}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Existing experiments */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : experiments.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4">
              Your Experiments
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {experiments.map((exp) => (
                <ExperimentCard key={exp.id} experiment={exp} />
              ))}
            </div>
          </div>
        )}

        {experiments.length === 0 && !loading && (
          <div className="text-center py-8 text-sm text-text-secondary flex items-center justify-center gap-2">
            <FlaskConical className="w-4 h-4" />
            No experiments yet — pick a path above to start your first one.
          </div>
        )}
      </main>
    </div>
  );
}
