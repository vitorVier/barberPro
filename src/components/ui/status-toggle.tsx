import React from "react";

interface StatusToggleProps {
  label: string;
  description: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function StatusToggle({
  label,
  description,
  isActive,
  onToggle,
  disabled = false,
}: StatusToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3.5 bg-slate-50/50">
      <div className="space-y-0.5 pr-2">
        <label className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
          isActive ? "bg-success" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isActive ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
