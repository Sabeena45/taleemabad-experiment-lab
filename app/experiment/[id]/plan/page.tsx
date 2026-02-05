"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CelebrationOverlay from "@/components/experiment/CelebrationOverlay";
import { Check, Download, Loader2, RefreshCw } from "lucide-react";
import type { ExperimentDesign } from "@/lib/db";

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);
  const [planSections, setPlanSections] = useState<{ title: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((exp: ExperimentDesign) => {
        setExperiment(exp);
        if (exp.study_plan && (exp.study_plan as Record<string, unknown>).sections) {
          setPlanSections(
            (exp.study_plan as { sections: { title: string; content: string }[] }).sections
          );
        } else if (exp.design_approved) {
          generatePlan(exp);
        }
      });
  }, [id]); // eslint-disable-line

  async function generatePlan(exp: ExperimentDesign) {
    setLoading(true);
    try {
      const context = JSON.stringify({
        problem: exp.problem_statement,
        hypotheses: exp.hypotheses,
        experiment_type: exp.experiment_type,
        sample_size: exp.adjusted_sample_size,
        arms: exp.intervention_arms,
        primary_outcome: exp.primary_outcome,
        population: exp.population_description,
        mde: exp.mde,
        power: exp.power_level,
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a pre-analysis plan for this experiment:\n\n${context}` }],
          level: "problem", // using generic prompt for plan generation
          context,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n").filter((l) => l.startsWith("data: "))) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try { fullContent += JSON.parse(data).text; } catch { /* skip */ }
          }
        }
      }

      // Try to extract sections from the response
      const sections: { title: string; content: string }[] = [];
      const sectionRegex = /#{1,3}\s*\d*\.?\s*(.+?)(?:\n)([\s\S]*?)(?=#{1,3}\s*\d|$)/g;
      let match;
      while ((match = sectionRegex.exec(fullContent)) !== null) {
        sections.push({ title: match[1].trim(), content: match[2].trim() });
      }

      if (sections.length === 0) {
        sections.push({ title: "Study Plan", content: fullContent });
      }

      setPlanSections(sections);
      await fetch(`/api/experiments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ study_plan: { sections } }),
      });
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_approved: true, current_level: 5, status: "plan_complete" }),
    });
    setShowCelebration(true);
  }

  function handleDownloadPDF() {
    // Simple text export for now
    const text = planSections
      .map((s) => `# ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${experiment?.title || "experiment"}_study_plan.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleDismiss = useCallback(() => {
    setShowCelebration(false);
    router.push(`/experiment/${id}/data`);
  }, [router, id]);

  if (!experiment) return null;

  if (!experiment.design_approved) {
    return (
      <div className="card text-center py-12">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-secondary">Complete Level 3 first.</p>
        <button onClick={() => router.push(`/experiment/${id}/design`)} className="btn-primary mt-4">
          Go to Study Design
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <div>
          <h2 className="font-display font-bold text-lg">Level 4: Study Plan</h2>
          <p className="text-sm text-text-secondary">Review your pre-analysis plan</p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-text-secondary">Generating your study plan...</p>
        </div>
      ) : (
        <>
          {planSections.map((section, i) => (
            <div key={i} className="card">
              <h3 className="font-display font-semibold text-sm text-primary mb-2">
                {section.title}
              </h3>
              <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={handleApprove} className="btn-success">
              <Check className="w-4 h-4" /> Approve Plan & Continue
            </button>
            <button onClick={handleDownloadPDF} className="btn-secondary">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={() => experiment && generatePlan(experiment)} className="btn-ghost">
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
        </>
      )}

      <CelebrationOverlay show={showCelebration} levelTitle="Study Plan" onDismiss={handleDismiss} />
    </div>
  );
}
