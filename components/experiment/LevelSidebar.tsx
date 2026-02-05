"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LEVELS } from "@/lib/db";
import { Check, Lock } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  experimentId: string;
  currentLevel: number;
  approvals: {
    problem_approved: boolean;
    hypothesis_approved: boolean;
    design_approved: boolean;
    plan_approved: boolean;
    collection_complete: boolean;
    report_approved: boolean;
  };
}

const APPROVAL_KEYS = [
  "problem_approved",
  "hypothesis_approved",
  "design_approved",
  "plan_approved",
  "collection_complete",
  "report_approved",
] as const;

export default function LevelSidebar({ experimentId, currentLevel, approvals }: Props) {
  const pathname = usePathname();

  function getLevelState(levelNumber: number) {
    const approvalKey = APPROVAL_KEYS[levelNumber - 1];
    const isApproved = approvals[approvalKey];
    const isActive = levelNumber === currentLevel;
    const isLocked = levelNumber > currentLevel;
    const isCurrent = pathname.includes(LEVELS[levelNumber - 1].path);

    return { isApproved, isActive, isLocked, isCurrent };
  }

  return (
    <nav className="w-64 shrink-0">
      <div className="sticky top-20 space-y-1">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3 px-3">
          Progress
        </p>

        {LEVELS.map((level) => {
          const { isApproved, isLocked, isCurrent } = getLevelState(level.number);
          const isAccessible = !isLocked || isApproved;

          return (
            <div key={level.number} className="relative">
              {/* Connector line */}
              {level.number < LEVELS.length && (
                <div
                  className={clsx(
                    "absolute left-[22px] top-[44px] w-0.5 h-4",
                    isApproved ? "bg-success" : "bg-gray-200"
                  )}
                />
              )}

              {isAccessible ? (
                <Link
                  href={`/experiment/${experimentId}/${level.path}`}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isCurrent
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-50 text-text-primary"
                  )}
                >
                  <LevelIcon
                    number={level.number}
                    isApproved={isApproved}
                    isActive={isCurrent}
                    isLocked={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{level.title}</p>
                    {isApproved && (
                      <p className="text-xs text-success">Complete</p>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl opacity-40 cursor-not-allowed">
                  <LevelIcon
                    number={level.number}
                    isApproved={false}
                    isActive={false}
                    isLocked={true}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary truncate">{level.title}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function LevelIcon({
  number,
  isApproved,
  isActive,
  isLocked,
}: {
  number: number;
  isApproved: boolean;
  isActive: boolean;
  isLocked: boolean;
}) {
  if (isApproved) {
    return (
      <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shrink-0">
        <Check className="w-4 h-4 text-white" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
        <Lock className="w-3.5 h-3.5 text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
        isActive
          ? "bg-primary text-white"
          : "bg-gray-100 text-text-secondary"
      )}
    >
      {number}
    </div>
  );
}
