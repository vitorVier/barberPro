"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  Users,
  Sparkles,
  CalendarDays,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/barbers", label: "Barbeiros", icon: Scissors },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/services", label: "Serviços", icon: Sparkles },
  { href: "/appointments", label: "Agendamentos", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-55 flex-col bg-navy text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber text-white font-bold text-sm">
          <Scissors className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">
            BarberPro
          </h1>
          <p className="text-[11px] text-sidebar-foreground/60 leading-tight">
            Gestão de Barbearia
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-amber text-white shadow-md shadow-amber/20"
                  : "text-sidebar-foreground hover:bg-navy-light hover:text-white"
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-sidebar-foreground/70 group-hover:text-white"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-sidebar-foreground/40">
          © 2026 BarberPro
        </p>
      </div>
    </aside>
  );
}
