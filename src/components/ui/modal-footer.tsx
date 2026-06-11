import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalFooterProps {
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function ModalFooter({
  onCancel,
  isPending,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  className,
}: ModalFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-4 border-t border-border mt-4", className)}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 text-sm font-bold text-navy-dark bg-linear-to-r from-amber to-amber-light hover:brightness-110 rounded-lg transition-all flex items-center gap-1.5 justify-center cursor-pointer disabled:opacity-50 disabled:hover:brightness-100 shadow-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
