"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Barber {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface BarberTabsProps {
  barbers: Barber[];
  activeId: string | null;
}

export function BarberTabs({ barbers, activeId }: BarberTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClick = useCallback(
    (barberId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (activeId === barberId) {
        params.delete("barber");
      } else {
        params.set("barber", barberId);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [activeId, pathname, router, searchParams]
  );

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {barbers.map((barber) => {
        const isActive = activeId === barber.id;

        return (
          <button
            key={barber.id}
            id={`barber-tab-${barber.id}`}
            onClick={() => handleClick(barber.id)}
            className={`
              group relative flex items-center gap-2 rounded-xl px-3.5 py-2
              text-sm font-semibold transition-all duration-300 ease-out
              cursor-pointer select-none border
              ${
                isActive
                  ? "bg-amber text-navy-dark border-amber shadow-lg shadow-amber/25"
                  : "bg-white text-slate-600 border-slate-200/80 hover:border-amber/40 hover:text-navy hover:shadow-md hover:shadow-amber/10"
              }
            `}
          >
            {/* Avatar */}
            <div
              className={`
                flex h-6 w-6 shrink-0 items-center justify-center rounded-lg
                text-[10px] font-bold tracking-wide transition-all duration-300
                ${
                  isActive
                    ? "bg-navy-dark/20 text-navy-dark"
                    : "bg-slate-100 text-slate-500 group-hover:bg-amber/10 group-hover:text-amber-dark"
                }
              `}
            >
              {barber.avatarUrl ? (
                <img
                  src={barber.avatarUrl}
                  alt={barber.name}
                  className="h-full w-full rounded-full object-cover object-center select-none"
                  style={{ imageRendering: "auto" }}
                />
              ) : (
                getInitials(barber.name)
              )}
            </div>

            <span className="truncate max-w-30">{barber.name}</span>
          </button>
        );
      })}
    </div>
  );
}
