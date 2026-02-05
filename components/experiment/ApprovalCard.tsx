"use client";

import { useState } from "react";
import { Check, Pencil, RefreshCw } from "lucide-react";

interface Props {
  title: string;
  content: string;
  onApprove: () => void;
  onEdit: (newContent: string) => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

export default function ApprovalCard({
  title,
  content,
  onApprove,
  onEdit,
  onRegenerate,
  isLoading,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  function handleSaveEdit() {
    onEdit(editValue);
    setIsEditing(false);
  }

  return (
    <div className="card border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wide">
          {title}
        </h3>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="input-field min-h-[200px] text-sm"
          />
          <div className="flex gap-2">
            <button onClick={handleSaveEdit} className="btn-primary text-sm">
              Save Changes
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditValue(content);
              }}
              className="btn-ghost text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap mb-4">
            {content}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="btn-success text-sm"
            >
              <Check className="w-4 h-4" />
              Approve & Continue
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              className="btn-secondary text-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="btn-ghost text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
