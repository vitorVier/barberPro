import { LucideIcon, Bell } from "lucide-react";

interface HeaderProps {
  icon: LucideIcon;
  span: string;
}

export function Header({ icon: Icon, span }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 px-4 sm:px-6 lg:px-8 backdrop-blur-xl shadow-glass transition-all">
      {/* Left side: Icon & Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber/10 to-amber/5 text-amber-dark shadow-inner border border-amber/20">
          <Icon className="h-4 sm:h-5 w-4 sm:w-5 drop-shadow-sm" />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            {span}
          </h2>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-amber border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}