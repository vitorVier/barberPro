import { LucideIcon, Bell } from "lucide-react";

interface HeaderProps {
  icon: LucideIcon;
  span: string;
}

export function Header({ icon: Icon, span }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md shadow-sm">
      {/* Left side: Icon & Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-amber/10 to-amber/5 text-amber shadow-inner border border-amber/20">
          <Icon className="h-5 w-5 drop-shadow-sm" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            {span}
          </h2>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}