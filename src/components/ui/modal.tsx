import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ElementType; // Permite passar ícones do Lucide
  children: React.ReactNode;
  disabled?: boolean;
  maxWidthClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  disabled = false,
  maxWidthClass = "max-w-md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white rounded-xl border border-border w-full ${maxWidthClass} shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-slate-50/50">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-amber" />}
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="text-slate-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        {children}
      </div>
    </div>
  );
}