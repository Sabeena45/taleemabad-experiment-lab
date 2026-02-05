"use client";

import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { getResourceBySlug, RESOURCES } from "@/lib/resources/content";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default function ResourceArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const resource = getResourceBySlug(slug);

  if (!resource) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-4xl mb-3">📚</p>
          <h1 className="font-display font-bold text-xl mb-2">Resource Not Found</h1>
          <p className="text-text-secondary mb-4">This article doesn&apos;t exist yet.</p>
          <button onClick={() => router.push("/resources")} className="btn-primary">
            Back to Resources
          </button>
        </main>
      </div>
    );
  }

  // Find prev/next
  const currentIndex = RESOURCES.findIndex((r) => r.slug === slug);
  const prev = currentIndex > 0 ? RESOURCES[currentIndex - 1] : null;
  const next = currentIndex < RESOURCES.length - 1 ? RESOURCES[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Resources
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{resource.icon}</span>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <span className="badge-info capitalize">{resource.category}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {resource.readTime}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-3">
            {resource.title}
          </h1>
          <p className="text-text-secondary leading-relaxed">
            {resource.summary}
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                Key Takeaway
              </p>
              <p className="text-sm text-text-primary">
                {resource.keyTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-sm max-w-none">
          <MarkdownRenderer content={resource.content} />
        </article>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          {prev ? (
            <Link
              href={`/resources/${prev.slug}`}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <div>
                <p className="text-xs text-text-secondary">Previous</p>
                <p className="font-medium">{prev.title}</p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/resources/${next.slug}`}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors text-right"
            >
              <div>
                <p className="text-xs text-text-secondary">Next</p>
                <p className="font-medium">{next.title}</p>
              </div>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Back to Lab CTA */}
        <div className="text-center mt-12 card bg-primary/5 border-primary/10 py-8">
          <p className="text-2xl mb-2">🧪</p>
          <h3 className="font-display font-bold mb-1">Ready to design your experiment?</h3>
          <p className="text-sm text-text-secondary mb-4">
            Put this knowledge into practice with our guided experiment builder.
          </p>
          <Link href="/" className="btn-primary inline-flex">
            Go to Experiment Lab
          </Link>
        </div>
      </main>
    </div>
  );
}

// Simple markdown renderer for article content
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-display font-bold text-base text-text-primary mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-display font-bold text-lg text-text-primary mt-8 mb-3">
          {line.slice(3)}
        </h2>
      );
    }
    // Code blocks
    else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`code-${i}`} className="bg-gray-50 rounded-xl p-4 text-xs font-mono overflow-x-auto my-4">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
    }
    // Tables
    else if (line.startsWith("|")) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i--;
        i++;
        i++;
      }
      i--;
      const headerRow = tableLines[0];
      const dataRows = tableLines.slice(2); // skip header and separator
      const headers = headerRow.split("|").filter(Boolean).map((h) => h.trim());

      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="text-left py-2 px-3 bg-gray-50 font-semibold text-text-primary border-b border-gray-200 text-xs">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => {
                const cells = row.split("|").filter(Boolean).map((c) => c.trim());
                return (
                  <tr key={ri} className="border-b border-gray-100">
                    {cells.map((cell, ci) => (
                      <td key={ci} className="py-2 px-3 text-text-secondary text-xs">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    // Bullet points
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      i--;
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-outside ml-5 my-3 space-y-1">
          {items.map((item, ii) => (
            <li key={ii} className="text-sm text-text-secondary leading-relaxed">
              <InlineFormat text={item} />
            </li>
          ))}
        </ul>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const items: string[] = [line.replace(/^\d+\.\s/, "")];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      i--;
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-outside ml-5 my-3 space-y-1">
          {items.map((item, ii) => (
            <li key={ii} className="text-sm text-text-secondary leading-relaxed">
              <InlineFormat text={item} />
            </li>
          ))}
        </ol>
      );
    }
    // Checkboxes
    else if (line.startsWith("- [ ]") || line.startsWith("- [x]")) {
      const checked = line.startsWith("- [x]");
      const text = line.slice(6);
      elements.push(
        <div key={i} className="flex items-center gap-2 text-sm text-text-secondary my-1">
          <input type="checkbox" checked={checked} readOnly className="rounded" />
          <span>{text}</span>
        </div>
      );
    }
    // Empty line
    else if (line.trim() === "") {
      // skip
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="text-sm text-text-secondary leading-relaxed my-3">
          <InlineFormat text={line} />
        </p>
      );
    }

    i++;
  }

  return <>{elements}</>;
}

function InlineFormat({ text }: { text: string }) {
  // Simple bold and inline code
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-text-primary">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
