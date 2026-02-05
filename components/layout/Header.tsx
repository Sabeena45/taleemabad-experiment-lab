"use client";

import Link from "next/link";
import { FlaskConical, BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-text-primary">
              Experiment Lab
            </span>
            <span className="hidden sm:inline text-xs text-text-secondary ml-2">
              Design rigorous experiments
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/resources" className="btn-ghost text-sm">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Resources</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
