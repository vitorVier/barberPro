"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  Users,
  CalendarDays,
  Contact,
  ChevronRight
} from "lucide-react";

import Image from "next/image";
import logoImg from "@/assets/logoImg2.png";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/appointments", label: "Agendamentos", icon: CalendarDays },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/barbers", label: "Barbeiros", icon: Contact },
  { href: "/services", label: "Serviços", icon: Scissors },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-navy-dark text-slate-300 border-r border-white/5 shadow-2xl shadow-navy-dark/50">

      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-amber/5 blur-[80px] pointer-events-none rounded-full -translate-y-1/2" />

      {/* Logo */}
      <div className="relative flex flex-col items-center text-center px-6 pt-10 pb-6 select-none border-b border-white/5 mb-4 z-10">
        <div className="relative mb-3 transition-transform duration-500 hover:scale-105 group cursor-pointer">
          {/* Logo Hover Glow */}
          <div className="absolute inset-0 bg-amber/20 blur-xl rounded-full scale-50 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <Image
            src={logoImg}
            alt="BarberPro Logo"
            width={100}
            height={100}
            className="object-contain drop-shadow-2xl relative z-10"
            priority
            quality={100}
          />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            BarberPro
          </h1>
          <p className="text-[10px] text-amber/80 font-semibold uppercase tracking-[0.2em] mt-1">
            Gestão de Barbearia
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 z-10 overflow-y-auto no-scrollbar pb-6">
        <div className="px-3 pb-2 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Principal
          </p>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${isActive
                  ? "bg-linear-to-r from-amber/15 to-transparent text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-amber rounded-r-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              )}

              <div className="flex items-center gap-3.5">
                <div className={`p-1.5 rounded-lg transition-colors duration-300 ${isActive
                    ? "bg-amber/10 text-amber"
                    : "text-slate-500 group-hover:text-amber/80 group-hover:bg-amber/5"
                  }`}>
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                </div>
                <span className={`transition-transform duration-300 ${isActive
                    ? "translate-x-1 font-semibold"
                    : "group-hover:translate-x-1"
                  }`}>
                  {item.label}
                </span>
              </div>

              {/* Chevron for active state */}
              {isActive && (
                <ChevronRight className="h-4 w-4 text-amber/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Support / User Snippet */}
      <div className="p-5 z-10 mt-auto border-t border-white/5">
        <div className="rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col items-center justify-center text-center transition-colors hover:bg-white/10 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-linear-to-tr from-amber to-amber-light flex items-center justify-center text-navy-dark font-bold shadow-lg shadow-amber/20 mb-2 group-hover:scale-105 transition-transform">
            VA
          </div>
          <p className="text-sm font-semibold text-white tracking-wide">Vitor Admin</p>
          <p className="text-xs text-slate-400 mt-0.5">Gestor Proprietário</p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-500/70 font-medium">
            © 2026 BarberPro v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
