"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CelebrationOverlay from "@/components/experiment/CelebrationOverlay";
import { Check, Download, Loader2, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ExperimentDesign } from "@/lib/db";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);
  const [reportSections, setReportSections] = useState<{ title: string; content: string }[]>([]);
  const [chartData, setChartData] = useState<{ name: string; treatment: number; control: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((exp: ExperimentDesign) => {
        setExperiment(exp);
        if (exp.report_content && (exp.report_content as Record<string, unknown>).sections) {
          setReportSections(
            (exp.report_content as { sections: { title: string; content: string }[] }).sections
          );
        }
        if (exp.charts && Array.isArray((exp.charts as Record<string, unknown>).data)) {
          setChartData((exp.charts as { data: typeof chartData }).data);
        }
        if (exp.collection_complete && !exp.report_content) {
          generateAnalysis(exp);
        }
      });
  }, [id]); // eslint-disable-line

  async function generateAnalysis(exp: ExperimentDesign) {
    setLoading(true);
    try {
      const context = JSON.stringify({
        experiment_type: exp.experiment_type,
        arms: exp.intervention_arms,
        primary_outcome: exp.primary_outcome,
        sample_size: exp.adjusted_sample_size,
        hypotheses: exp.hypotheses,
        problem: exp.problem_statement,
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Generate an analysis report for this completed experiment. Include findings, effect sizes, and recommendations. Create sample data for visualization since we're demonstrating the platform.\n\nExperiment context:\n${context}`,
          }],
          level: "analysis",
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

      // Parse sections
      const sections: { title: string; content: string }[] = [];
      const sectionRegex = /#{1,3}\s*\d*\.?\s*(.+?)(?:\n)([\s\S]*?)(?=#{1,3}\s*\d|$)/g;
      let match;
      while ((match = sectionRegex.exec(fullContent)) !== null) {
        sections.push({ title: match[1].trim(), content: match[2].trim() });
      }
      if (sections.length === 0) {
        sections.push({ title: "Analysis Report", content: fullContent });
      }

      // Generate sample chart data
      const arms = exp.intervention_arms || [];
      const sampleChart = arms.map((arm) => ({
        name: arm.name,
        treatment: arm.name.toLowerCase().includes("control")
          ? Math.round(40 + Math.random() * 20)
          : Math.round(55 + Math.random() * 25),
        control: Math.round(40 + Math.random() * 20),
      }));

      setReportSections(sections);
      setChartData(sampleChart);

      await fetch(`/api/experiments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_content: { sections },
          charts: { data: sampleChart },
        }),
      });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_approved: true, status: "complete" }),
    });
    setShowCelebration(true);
  }

  function handleDownload() {
    const text = reportSections
      .map((s) => `# ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${experiment?.title?.replace(/\s+/g, "_") || "experiment"}_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleDismiss = useCallback(() => {
    setShowCelebration(false);
    router.push("/");
  }, [router]);

  if (!experiment) return null;

  if (!experiment.collection_complete) {
    return (
      <div className="card text-center py-12">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-secondary">Complete data collection first.</p>
        <button onClick={() => router.push(`/experiment/${id}/data`)} className="btn-primary mt-4">
          Go to Data Collection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📈</span>
        <div>
          <h2 className="font-display font-bold text-lg">Level 6: Analysis & Report</h2>
          <p className="text-sm text-text-secondary">Review your results and generate the final report</p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-text-secondary">Running analysis and generating report...</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold mb-4">Results Comparison</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="treatment" fill="#0170b9" radius={[4, 4, 0, 0]} name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Report sections */}
          {reportSections.map((section, i) => (
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
            {!experiment.report_approved && (
              <button onClick={handleApprove} className="btn-success">
                <Check className="w-4 h-4" /> Approve Report
              </button>
            )}
            <button onClick={handleDownload} className="btn-secondary">
              <Download className="w-4 h-4" /> Download Report
            </button>
            {!experiment.report_approved && (
              <button onClick={() => experiment && generateAnalysis(experiment)} className="btn-ghost">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            )}
          </div>

          {experiment.report_approved && (
            <div className="card bg-success/5 border-success/20 text-center py-8">
              <p className="text-4xl mb-2">🏆</p>
              <h3 className="font-display font-bold text-lg text-success">
                Experiment Complete!
              </h3>
              <p className="text-sm text-text-secondary mt-1 mb-4">
                Congratulations! You designed and completed a rigorous experiment.
              </p>
              <button onClick={() => router.push("/")} className="btn-primary">
                Back to Dashboard
              </button>
            </div>
          )}
        </>
      )}

      <CelebrationOverlay show={showCelebration} levelTitle="Analysis & Report" onDismiss={handleDismiss} />
    </div>
  );
}
