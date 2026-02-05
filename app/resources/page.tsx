"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { RESOURCES, type Resource } from "@/lib/resources/content";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "All", icon: "📚" },
  { key: "statistics", label: "Statistics", icon: "📊" },
  { key: "design", label: "Study Design", icon: "🔬" },
  { key: "practice", label: "Best Practices", icon: "✅" },
  { key: "policy", label: "Policy", icon: "🏛️" },
] as const;

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? RESOURCES
      : RESOURCES.filter((r) => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 badge-info mb-4">
            <BookOpen className="w-3 h-3" />
            Learn experiment design
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary mb-3">
            Resource Corner
          </h1>
          <p className="text-lg text-text-secondary max-w-xl mx-auto">
            Everything you need to know about designing rigorous experiments — from
            sample sizes to policy impact.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-gray-200 text-text-secondary hover:border-gray-300"
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>

        {/* Back to Lab */}
        <div className="text-center mt-12">
          <Link href="/" className="btn-ghost text-sm inline-flex items-center gap-2">
            ← Back to Experiment Lab
          </Link>
        </div>
      </main>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/resources/${resource.slug}`}
      className="card card-hover group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{resource.icon}</span>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Clock className="w-3 h-3" />
          {resource.readTime}
        </div>
      </div>

      <h3 className="font-display font-semibold text-sm text-text-primary mb-2 group-hover:text-primary transition-colors">
        {resource.title}
      </h3>

      <p className="text-xs text-text-secondary leading-relaxed mb-3">
        {resource.summary}
      </p>

      <div className="bg-primary/5 rounded-lg p-2.5 mb-3">
        <p className="text-xs text-primary font-medium">
          💡 {resource.keyTakeaway}
        </p>
      </div>

      <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
        Read more <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}
