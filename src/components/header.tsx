import { LucideIcon } from "lucide-react";

interface HeaderProps {
  icon: LucideIcon;
  span: string;
}

export function Header({ icon: Icon, span }: HeaderProps) {
  return (
    <header className="flex items-center gap-2 border-b border-border bg-white px-6 py-6">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-base font-medium text-foreground">{span}</span>
    </header>
  );
}