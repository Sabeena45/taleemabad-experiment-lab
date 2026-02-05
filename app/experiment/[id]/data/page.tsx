"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CelebrationOverlay from "@/components/experiment/CelebrationOverlay";
import { Upload, Download, Calendar, Check, AlertCircle } from "lucide-react";
import type { ExperimentDesign } from "@/lib/db";

export default function DataPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [experiment, setExperiment] = useState<ExperimentDesign | null>(null);
  const [deadline, setDeadline] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((exp: ExperimentDesign) => {
        setExperiment(exp);
        if (exp.collection_deadline) setDeadline(exp.collection_deadline);
        if (exp.data_uploads?.length) setUploadedFile(exp.data_uploads[0].filename);
      });
  }, [id]);

  function generateTemplate() {
    if (!experiment) return;
    const arms = experiment.intervention_arms || [
      { name: "Treatment", description: "", allocation_pct: 50 },
      { name: "Control", description: "", allocation_pct: 50 },
    ];

    const headers = [
      "participant_id",
      "arm",
      experiment.primary_outcome?.replace(/\s+/g, "_").toLowerCase() || "outcome",
      "baseline_score",
      "endline_score",
      "gender",
      "age",
      "cluster_id",
      "notes",
    ];

    const sampleRows = arms.flatMap((arm, i) =>
      [1, 2, 3].map((j) =>
        [
          `P${String(i * 3 + j).padStart(3, "0")}`,
          arm.name,
          "",
          "",
          "",
          j % 2 === 0 ? "F" : "M",
          Math.floor(Math.random() * 10 + 8),
          `C${String(i + 1).padStart(2, "0")}`,
          "",
        ].join(",")
      )
    );

    const csv = [headers.join(","), ...sampleRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${experiment.title?.replace(/\s+/g, "_") || "experiment"}_data_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleFile(file: File) {
    setUploadedFile(file.name);
    // Store file reference (in production, upload to cloud storage)
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data_uploads: [
          { filename: file.name, url: "", uploaded_at: new Date().toISOString(), type: file.type },
        ],
      }),
    });
  }

  async function handleComplete() {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        collection_complete: true,
        collection_deadline: deadline || null,
        current_level: 6,
        status: "analyzing",
      }),
    });
    setShowCelebration(true);
  }

  async function saveDeadline() {
    await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection_deadline: deadline }),
    });
  }

  const handleDismiss = useCallback(() => {
    setShowCelebration(false);
    router.push(`/experiment/${id}/analysis`);
  }, [router, id]);

  if (!experiment) return null;

  if (!experiment.plan_approved) {
    return (
      <div className="card text-center py-12">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-secondary">Complete Level 4 first.</p>
        <button onClick={() => router.push(`/experiment/${id}/plan`)} className="btn-primary mt-4">
          Go to Study Plan
        </button>
      </div>
    );
  }

  const deadlinePassed = deadline && new Date(deadline) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📊</span>
        <div>
          <h2 className="font-display font-bold text-lg">Level 5: Data Collection</h2>
          <p className="text-sm text-text-secondary">Collect your data and upload when ready</p>
        </div>
      </div>

      {/* Template */}
      <div className="card">
        <h3 className="font-display font-semibold mb-2">Data Template</h3>
        <p className="text-sm text-text-secondary mb-3">
          Download a CSV template pre-configured for your study design with the right columns.
        </p>
        <button onClick={generateTemplate} className="btn-secondary text-sm">
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>

      {/* Deadline */}
      <div className="card">
        <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Collection Deadline
        </h3>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input-field w-48"
          />
          <button onClick={saveDeadline} className="btn-ghost text-sm">Save</button>
        </div>
        {deadlinePassed && (
          <div className="flex items-center gap-2 mt-2 text-warning text-sm">
            <AlertCircle className="w-4 h-4" />
            Deadline has passed. Time to upload your data!
          </div>
        )}
      </div>

      {/* Upload */}
      <div className="card">
        <h3 className="font-display font-semibold mb-2">Upload Data</h3>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-gray-200"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div>
              <p className="text-success font-medium mb-1">✓ {uploadedFile}</p>
              <p className="text-xs text-text-secondary">File uploaded successfully</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-text-secondary mb-2">
                Drag & drop your CSV file here
              </p>
              <label className="btn-secondary text-sm cursor-pointer">
                Browse Files
                <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileInput} />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Complete */}
      {uploadedFile && (
        <button onClick={handleComplete} className="btn-success">
          <Check className="w-4 h-4" /> Data Complete — Run Analysis
        </button>
      )}

      <CelebrationOverlay show={showCelebration} levelTitle="Data Collection" onDismiss={handleDismiss} />
    </div>
  );
}
