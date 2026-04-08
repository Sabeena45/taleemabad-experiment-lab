"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CelebrationOverlay from "@/components/experiment/CelebrationOverlay";
import { Check, Pencil, RefreshCw, Loader2, Star } from "lucide-react";
import type { ExperimentDesign, Hypothesis } from "@/lib/db";

export default function HypothesisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [theoryOfChange, setTheoryOfChange] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((exp: ExperimentDesign) => {
        setExperiment(exp);
        if (exp.hypotheses?.length) {
          setHypotheses(exp.hypotheses);
          setTheoryOfChange(exp.theory_of_change || "");
        } else if (exp.problem_approved && exp.problem_statement) {
          generateHypotheses(exp.problem_statement);
        }
      });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generateHypotheses(problemStatement: string) {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate hypotheses for this problem:\n\n${problemStatement}`,
            },
          ],
          level: "hypothesis",
          context: `Problem statement: ${problemStatement}`,
        }),
      });
      clearTimeout(timeout);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              fullContent += JSON.parse(data).text;
            } catch {
              // skip
            }
          }
        }
      }

      // Try to parse JSON from response
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const hyps: Hypothesis[] = parsed.hypotheses || [];
          setHypotheses(hyps);
          setTheoryOfChange(parsed.theory_of_change || "");
          await saveHypotheses(hyps, parsed.theory_of_change || "");
        }
      } catch {
        // If JSON parsing fails, create basic hypotheses from text
        setHypotheses([
          { text: fullContent.substring(0, 500), isPrimary: true, approved: false },
        ]);
      }
    } catch (error) {
      console.error("Failed to generate hypotheses:", error);
      if (error instanceof DOMException && error.name === "AbortError") {
        // Request timed out - could set an error state here if needed
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveHypotheses(hyps: Hypothesis[], toc: string) {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hypotheses: hyps, theory_of_change: toc }),
    });
  }

  function setPrimary(idx: number) {
    const updated = hypotheses.map((h, i) => ({ ...h, isPrimary: i === idx }));
    setHypotheses(updated);
    saveHypotheses(updated, theoryOfChange);
  }

  function saveEdit(idx: number) {
    const updated = [...hypotheses];
    updated[idx] = { ...updated[idx], text: editText };
    setHypotheses(updated);
    setEditingIdx(null);
    saveHypotheses(updated, theoryOfChange);
  }

  async function handleApprove() {
    const hasPrimary = hypotheses.some((h) => h.isPrimary);
    if (!hasPrimary) {
      alert("Please mark one hypothesis as primary before continuing.");
      return;
    }

    const res = await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hypotheses,
        theory_of_change: theoryOfChange,
        hypothesis_approved: true,
        current_level: 3,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Failed to save: ${err.error || res.statusText}. Please try again.`);
      return;
    }

    setShowCelebration(true);
  }

  const handleDismiss = useCallback(() => {
    setShowCelebration(false);
    router.push(`/experiment/${id}/design`);
  }, [router, id]);

  if (!experiment) return null;

  if (!experiment.problem_approved) {
    return (
      <div className="card text-center py-12">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-secondary">Complete Level 1 first.</p>
        <button
          onClick={() => router.push(`/experiment/${id}/problem`)}
          className="btn-primary mt-4"
        >
          Go to Problem Statement
        </button>
      </div>
    );
  }

  if (experiment.hypothesis_approved) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">✅</p>
        <h3 className="font-display font-bold text-lg mb-1">Hypotheses Approved</h3>
        <p className="text-sm text-text-secondary mb-4">Move on to study design.</p>
        <button
          onClick={() => router.push(`/experiment/${id}/design`)}
          className="btn-primary"
        >
          Go to Level 3: Study Design →
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💡</span>
        <div>
          <h2 className="font-display font-bold text-lg">Level 2: Hypothesis</h2>
          <p className="text-sm text-text-secondary">
            Review and approve your testable hypotheses
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-text-secondary">Generating hypotheses from your problem statement...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hypotheses.map((h, i) => (
            <div
              key={i}
              className={`card ${h.isPrimary ? "border-2 border-warning/50 bg-amber-50/30" : ""}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="badge-info text-xs">Hypothesis {i + 1}</span>
                <button
                  onClick={() => setPrimary(i)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    h.isPrimary
                      ? "text-warning font-medium"
                      : "text-text-secondary hover:text-warning"
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${h.isPrimary ? "fill-warning" : ""}`} />
                  {h.isPrimary ? "Primary" : "Set as primary"}
                </button>
              </div>

              {editingIdx === i ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input-field min-h-[100px] text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(i)} className="btn-primary text-sm">
                      Save
                    </button>
                    <button onClick={() => setEditingIdx(null)} className="btn-ghost text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <p className="text-sm text-text-primary leading-relaxed flex-1">
                    {h.text}
                  </p>
                  <button
                    onClick={() => {
                      setEditingIdx(i);
                      setEditText(h.text);
                    }}
                    className="btn-ghost p-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {theoryOfChange && (
            <div className="card bg-accent/5 border-accent/20">
              <h3 className="font-display font-semibold text-sm text-accent mb-2">
                Theory of Change
              </h3>
              <p className="text-sm text-text-primary leading-relaxed">{theoryOfChange}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button onClick={handleApprove} className="btn-success">
              <Check className="w-4 h-4" />
              Approve Hypotheses & Continue
            </button>
            <button
              onClick={() => generateHypotheses(experiment.problem_statement || "")}
              className="btn-ghost"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}

      <CelebrationOverlay
        show={showCelebration}
        levelTitle="Hypothesis"
        onDismiss={handleDismiss}
      />
    </div>
  );
}
