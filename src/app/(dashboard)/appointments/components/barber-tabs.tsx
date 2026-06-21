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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2">
      <button
        id="barber-tab-all"
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("barber");
          router.push(`${pathname}?${params.toString()}`);
        }}
        className={`
          group relative flex items-center gap-2 rounded-full px-4 py-2 shrink-0
          text-sm font-semibold transition-all duration-200 ease-out
          cursor-pointer select-none border
          ${!activeId
            ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20"
            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        <span className="truncate max-w-30 py-0.5">Todos</span>
      </button>

      {barbers.map((barber) => {
        const isActive = activeId === barber.id;

        return (
          <button
            key={barber.id}
            id={`barber-tab-${barber.id}`}
            onClick={() => handleClick(barber.id)}
            className={`
              group relative flex items-center gap-2.5 rounded-full px-4 py-1.5 shrink-0
              text-sm font-semibold transition-all duration-200 ease-out
              cursor-pointer select-none border
              ${isActive
                ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
              }
            `}
          >
            {/* Avatar */}
            <div
              className={`
                flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                text-[10px] font-bold tracking-wide transition-all duration-200 overflow-hidden
                ${isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                }
              `}
            >
              {barber.avatarUrl ? (
                <img
                  src={barber.avatarUrl}
                  alt={barber.name}
                  className="h-full w-full object-cover object-center select-none"
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
