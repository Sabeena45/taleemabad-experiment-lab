"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CelebrationOverlay from "@/components/experiment/CelebrationOverlay";
import { Check, Plus, Trash2, Info, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { ExperimentDesign, InterventionArm } from "@/lib/db";
import type { SampleSizeResult } from "@/lib/sample-size";

interface Recommendation {
  recommended_type: string;
  confidence: string;
  reasoning: string;
  alternatives: { type: string; why_not: string }[];
  suggested_arms: { name: string; description: string; allocation_pct: number }[];
  suggested_outcomes: { primary: string; secondary: string[] };
  design_considerations: string[];
}

const EXP_TYPES = [
  { value: "rct", label: "RCT", desc: "Random assignment to treatment & control", icon: "🎲" },
  { value: "cluster_rct", label: "Cluster RCT", desc: "Randomize groups (schools, villages)", icon: "🏫" },
  { value: "quasi", label: "Quasi-Experiment", desc: "Use matching or natural variation", icon: "🔄" },
  { value: "ab_test", label: "A/B Test", desc: "Digital randomization of features", icon: "📱" },
  { value: "did", label: "Diff-in-Diff", desc: "Compare changes over time", icon: "📊" },
  { value: "pilot", label: "Pilot Study", desc: "Small-scale feasibility test", icon: "🧪" },
];

export default function DesignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);
  const [expType, setExpType] = useState("rct");
  const [populationDesc, setPopulationDesc] = useState("");
  const [populationSize, setPopulationSize] = useState<number>(1000);
  const [mde, setMde] = useState(0.3);
  const [power, setPower] = useState(0.8);
  const [alpha, setAlpha] = useState(0.05);
  const [icc, setIcc] = useState(0.1);
  const [clusterSize, setClusterSize] = useState(30);
  const [attrition, setAttrition] = useState(0.1);
  const [primaryOutcome, setPrimaryOutcome] = useState("");
  const [arms, setArms] = useState<InterventionArm[]>([
    { name: "Treatment", description: "Receives the intervention", allocation_pct: 50 },
    { name: "Control", description: "Business as usual", allocation_pct: 50 },
  ]);
  const [calcResult, setCalcResult] = useState<(SampleSizeResult & { powerCurve: { mde: number; sampleSize: number }[] }) | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const isCluster = expType === "cluster_rct" || expType === "quasi";

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((exp: ExperimentDesign) => {
        setExperiment(exp);
        // Only restore saved values if design was already in progress
        if (exp.experiment_type) setExpType(exp.experiment_type);
        if (exp.population_description) setPopulationDesc(exp.population_description);
        if (exp.population_size) setPopulationSize(exp.population_size);
        if (exp.mde) setMde(exp.mde);
        if (exp.power_level) setPower(exp.power_level);
        if (exp.icc) setIcc(exp.icc);
        if (exp.cluster_size) setClusterSize(exp.cluster_size);
        if (exp.attrition_rate) setAttrition(exp.attrition_rate);
        if (exp.primary_outcome) setPrimaryOutcome(exp.primary_outcome);
        if (exp.intervention_arms?.length) setArms(exp.intervention_arms);

        // Fetch AI recommendation if problem is approved and no type was saved yet
        if (exp.problem_approved && !exp.experiment_type) {
          fetchRecommendation(exp);
        }
      });
  }, [id]); // eslint-disable-line

  async function fetchRecommendation(exp: ExperimentDesign) {
    setLoadingRec(true);
    try {
      const res = await fetch("/api/recommend-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experimentId: exp.id }),
      });
      if (res.ok) {
        const rec: Recommendation = await res.json();
        setRecommendation(rec);
        // Auto-fill from recommendation
        if (rec.recommended_type) setExpType(rec.recommended_type);
        if (rec.suggested_outcomes?.primary) setPrimaryOutcome(rec.suggested_outcomes.primary);
        if (rec.suggested_arms?.length) setArms(rec.suggested_arms);
      }
    } catch {
      // Recommendation is optional — fail silently
    } finally {
      setLoadingRec(false);
    }
  }

  useEffect(() => {
    calculateSample();
  }, [expType, mde, power, alpha, icc, clusterSize, attrition, arms.length]); // eslint-disable-line

  async function calculateSample() {
    try {
      const res = await fetch("/api/sample-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentType: expType,
          mde, power, alpha,
          allocationRatio: 0.5,
          icc: isCluster ? icc : undefined,
          clusterSize: isCluster ? clusterSize : undefined,
          attritionRate: attrition,
          numArms: arms.length,
        }),
      });
      if (res.ok) setCalcResult(await res.json());
    } catch {
      // skip
    }
  }

  function addArm() {
    const pct = Math.floor(100 / (arms.length + 1));
    setArms([...arms, { name: `Arm ${arms.length + 1}`, description: "", allocation_pct: pct }]);
  }

  function removeArm(idx: number) {
    if (arms.length <= 2) return;
    setArms(arms.filter((_, i) => i !== idx));
  }

  function updateArm(idx: number, field: keyof InterventionArm, value: string | number) {
    const updated = [...arms];
    updated[idx] = { ...updated[idx], [field]: value };
    setArms(updated);
  }

  async function handleApprove() {
    if (!primaryOutcome.trim()) {
      alert("Please specify a primary outcome before continuing.");
      return;
    }
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experiment_type: expType,
        population_description: populationDesc,
        population_size: populationSize,
        mde, power_level: power, significance_level: alpha,
        icc: isCluster ? icc : null,
        cluster_size: isCluster ? clusterSize : null,
        attrition_rate: attrition,
        calculated_sample_size: calcResult?.totalSampleSize,
        adjusted_sample_size: calcResult?.adjustedForAttrition,
        intervention_arms: arms,
        primary_outcome: primaryOutcome,
        design_approved: true,
        current_level: 4,
      }),
    });
    setShowCelebration(true);
  }

  const handleDismiss = useCallback(() => {
    setShowCelebration(false);
    router.push(`/experiment/${id}/plan`);
  }, [router, id]);

  if (!experiment) return null;

  if (!experiment.hypothesis_approved) {
    return (
      <div className="card text-center py-12">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-secondary">Complete Level 2 first.</p>
        <button
          onClick={() => router.push(`/experiment/${id}/hypothesis`)}
          className="btn-primary mt-4"
        >
          Go to Hypothesis
        </button>
      </div>
    );
  }

  if (experiment.design_approved) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">✅</p>
        <h3 className="font-display font-bold text-lg mb-1">Study Design Approved</h3>
        <button onClick={() => router.push(`/experiment/${id}/plan`)} className="btn-primary mt-4">
          Go to Level 4: Study Plan →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔬</span>
        <div>
          <h2 className="font-display font-bold text-lg">Level 3: Study Design</h2>
          <p className="text-sm text-text-secondary">Choose your method and calculate sample size</p>
        </div>
      </div>

      {/* AI Recommendation */}
      {loadingRec && (
        <div className="card border-primary/20 bg-primary/5 animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-sm text-primary font-medium">Analyzing your problem statement...</p>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 bg-primary/10 rounded w-3/4" />
            <div className="h-3 bg-primary/10 rounded w-1/2" />
          </div>
        </div>
      )}

      {recommendation && !loadingRec && (
        <div className="card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-sm text-primary">AI Recommendation</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                recommendation.confidence === "high"
                  ? "bg-emerald-50 text-emerald-700"
                  : recommendation.confidence === "medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {recommendation.confidence} confidence
              </span>
            </div>
          </div>
          <p className="text-sm text-text-primary mb-3">
            Based on your problem statement, we recommend{" "}
            <strong>{EXP_TYPES.find((t) => t.value === recommendation.recommended_type)?.label || recommendation.recommended_type}</strong>.
          </p>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">{recommendation.reasoning}</p>

          {/* Design Considerations */}
          {recommendation.design_considerations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {recommendation.design_considerations.map((c, i) => (
                <span key={i} className="text-xs bg-white/60 border border-primary/10 rounded-lg px-2 py-1 text-text-secondary">
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Alternatives */}
          {recommendation.alternatives?.length > 0 && (
            <div>
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors"
              >
                {showAlternatives ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showAlternatives ? "Hide" : "Show"} alternatives considered
              </button>
              {showAlternatives && (
                <div className="mt-2 space-y-1.5">
                  {recommendation.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="font-medium text-text-primary min-w-[80px]">
                        {EXP_TYPES.find((t) => t.value === alt.type)?.label || alt.type}
                      </span>
                      <span>{alt.why_not}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Experiment Type */}
      <div className="card">
        <h3 className="font-display font-semibold mb-3">
          Experiment Type
          {recommendation && expType !== recommendation.recommended_type && (
            <span className="text-xs font-normal text-text-secondary ml-2">(overriding AI recommendation)</span>
          )}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {EXP_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setExpType(t.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                expType === t.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <p className="font-medium text-sm mt-1">{t.label}</p>
              <p className="text-xs text-text-secondary">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Population */}
      <div className="card">
        <h3 className="font-display font-semibold mb-3">Population</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Who are you studying?</label>
            <input
              value={populationDesc}
              onChange={(e) => setPopulationDesc(e.target.value)}
              placeholder="e.g., Grade 3 students in rural Punjab"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">Total population size (approximate)</label>
            <input
              type="number"
              value={populationSize}
              onChange={(e) => setPopulationSize(parseInt(e.target.value) || 0)}
              className="input-field w-48"
            />
          </div>
        </div>
      </div>

      {/* Sample Size Calculator */}
      <div className="card">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          Sample Size Calculator
          <span className="badge-info text-xs">Live</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-text-secondary flex items-center gap-1">
              MDE (std dev) <span title="Minimum Detectable Effect: smallest effect worth detecting"><Info className="w-3 h-3" /></span>
            </label>
            <input type="number" step="0.05" min="0.05" max="2"
              value={mde} onChange={(e) => setMde(parseFloat(e.target.value) || 0.1)}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Power</label>
            <select value={power} onChange={(e) => setPower(parseFloat(e.target.value))}
              className="input-field mt-1">
              <option value={0.8}>80%</option>
              <option value={0.9}>90%</option>
              <option value={0.95}>95%</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Significance (α)</label>
            <select value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="input-field mt-1">
              <option value={0.05}>5%</option>
              <option value={0.01}>1%</option>
              <option value={0.1}>10%</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-secondary">Attrition rate</label>
            <input type="number" step="0.05" min="0" max="0.5"
              value={attrition} onChange={(e) => setAttrition(parseFloat(e.target.value) || 0)}
              className="input-field mt-1"
            />
          </div>
          {isCluster && (
            <>
              <div>
                <label className="text-xs text-text-secondary flex items-center gap-1">
                  ICC <span title="Intra-class correlation: how similar people within clusters are"><Info className="w-3 h-3" /></span>
                </label>
                <input type="number" step="0.01" min="0" max="1"
                  value={icc} onChange={(e) => setIcc(parseFloat(e.target.value) || 0)}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary">Cluster size (avg)</label>
                <input type="number" min="2"
                  value={clusterSize} onChange={(e) => setClusterSize(parseInt(e.target.value) || 2)}
                  className="input-field mt-1"
                />
              </div>
            </>
          )}
        </div>

        {/* Result */}
        {calcResult && (
          <div className="bg-primary/5 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <p className="stat-number text-primary">{calcResult.adjustedForAttrition.toLocaleString()}</p>
                <p className="text-xs text-text-secondary">Total Sample</p>
              </div>
              <div className="text-center">
                <p className="stat-number text-primary">{calcResult.perArmSize.toLocaleString()}</p>
                <p className="text-xs text-text-secondary">Per Arm</p>
              </div>
              {calcResult.numClusters && (
                <div className="text-center">
                  <p className="stat-number text-primary">{calcResult.numClusters}</p>
                  <p className="text-xs text-text-secondary">Clusters Needed</p>
                </div>
              )}
            </div>
            <p className="text-sm text-text-secondary">{calcResult.explanation}</p>
          </div>
        )}

        {/* Power curve */}
        {calcResult?.powerCurve && (
          <div className="h-48">
            <p className="text-xs text-text-secondary mb-2">Sample size by MDE</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calcResult.powerCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="mde" tick={{ fontSize: 11 }} label={{ value: "MDE (SD)", position: "bottom", fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={60} />
                <Tooltip />
                <Line type="monotone" dataKey="sampleSize" stroke="#0170b9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Intervention Arms */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold">Intervention Arms</h3>
          <button onClick={addArm} className="btn-ghost text-sm">
            <Plus className="w-4 h-4" /> Add Arm
          </button>
        </div>
        <div className="space-y-2">
          {arms.map((arm, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-gray-50">
              <div className="flex-1 space-y-2">
                <input
                  value={arm.name}
                  onChange={(e) => updateArm(i, "name", e.target.value)}
                  placeholder="Arm name"
                  className="input-field py-2 text-sm"
                />
                <input
                  value={arm.description}
                  onChange={(e) => updateArm(i, "description", e.target.value)}
                  placeholder="Description"
                  className="input-field py-2 text-sm"
                />
              </div>
              <div className="w-20">
                <input
                  type="number"
                  value={arm.allocation_pct}
                  onChange={(e) => updateArm(i, "allocation_pct", parseInt(e.target.value) || 0)}
                  className="input-field py-2 text-sm text-center"
                />
                <p className="text-xs text-text-secondary text-center mt-0.5">%</p>
              </div>
              {arms.length > 2 && (
                <button onClick={() => removeArm(i)} className="text-error p-1 mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Primary Outcome */}
      <div className="card">
        <h3 className="font-display font-semibold mb-3">Primary Outcome</h3>
        <input
          value={primaryOutcome}
          onChange={(e) => setPrimaryOutcome(e.target.value)}
          placeholder="e.g., Student reading scores on standardized assessment"
          className="input-field"
        />
        <p className="text-xs text-text-secondary mt-2">
          The single most important thing you will measure to test your hypothesis.
        </p>
      </div>

      {/* Approve */}
      <div className="flex gap-3">
        <button onClick={handleApprove} className="btn-success">
          <Check className="w-4 h-4" />
          Approve Design & Continue
        </button>
      </div>

      <CelebrationOverlay show={showCelebration} levelTitle="Study Design" onDismiss={handleDismiss} />
    </div>
  );
}
