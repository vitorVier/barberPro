"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  optional?: boolean;
}

export function FormInput({
  label,
  icon: Icon,
  error,
  required,
  optional,
  className = "",
  ...props
}: FormInputProps) {
    return (
    <div className="space-y-1.5">
      <label
        htmlFor={props.id}
        className="text-sm font-semibold text-slate-800"
      >
        {label}

        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}

        {optional && (
          <span className="text-xs text-slate-400 font-normal ml-1">
            (Opcional)
          </span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        )}

        <input
          {...props}
          className={`
            flex h-10 w-full rounded-lg border
            border-slate-200 bg-white
            ${Icon ? "pl-10" : "pl-3"}
            pr-3 py-2 text-sm
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-1
            focus:ring-amber
            focus:border-amber
            transition-all
            disabled:opacity-50
            ${error ? "border-red-300" : ""}
            ${className}
          `}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}