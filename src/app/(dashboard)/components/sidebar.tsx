"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  Users,
  CalendarDays,
  Contact,
} from "lucide-react";

import Image from "next/image";
import logoImg from "@/assets/logoImg2.png";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/barbers", label: "Barbeiros", icon: Contact },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/services", label: "Serviços", icon: Scissors },
  { href: "/appointments", label: "Agendamentos", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-55 flex-col bg-navy text-sidebar-foreground">
      {/* Logo */}
      <div className="flex flex-col items-center text-center px-5 pt-8 pb-5 select-none border-b border-sidebar-border/20 mb-3">
        <div className="mb-1 transition-transform duration-300 hover:scale-105">
          <Image
            src={logoImg}
            alt="BarberPro Logo"
            width={100}
            height={100}
            className="object-contain"
            priority
            quality={100}
          />
        </div>
        
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">
            BarberPro
          </h1>
          <p className="text-[11px] text-sidebar-foreground/50 uppercase tracking-widest mt-0.5">
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
