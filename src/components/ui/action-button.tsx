import { Plus } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ElementType;
}

export function ActionButton({
  children,
  className,
  icon: Icon = Plus,
  ...props
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-amber to-amber-light px-4 py-2.5 text-sm font-bold text-navy-dark transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber/20 cursor-pointer",
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
