"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  currentDate: string; // ISO date string
}

export function DateNavigator({ currentDate }: DateNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const date = new Date(currentDate + "T12:00:00");

  useEffect(() => {
    // Format: YYYY-MM-DD for the input
    setInputValue(currentDate);
  }, [currentDate]);

  const navigateToDate = useCallback(
    (newDate: Date) => {
      const params = new URLSearchParams(searchParams.toString());
      const isoDate = newDate.toISOString().split("T")[0];
      params.set("date", isoDate);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const goToToday = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const goPrev = useCallback(() => {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    navigateToDate(prev);
  }, [date, navigateToDate]);

  const goNext = useCallback(() => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    navigateToDate(next);
  }, [date, navigateToDate]);

  const handleDateInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      if (val) {
        navigateToDate(new Date(val + "T12:00:00"));
      }
    },
    [navigateToDate]
  );

  // Format the date in Portuguese
  const formattedDate = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Capitalize first letter
  const displayDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Check if current date is today
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Prev button */}
        <button
          id="date-nav-prev"
          onClick={goPrev}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 transition-all duration-200 hover:border-amber/40 hover:text-amber hover:shadow-sm cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Date display */}
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] font-semibold text-navy tracking-tight">
            {displayDate}
          </h3>

          {/* Today badge */}
          {isToday ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-200">
              Hoje
            </span>
          ) : (
            <button
              id="date-nav-today"
              onClick={goToToday}
              className="inline-flex items-center rounded-md bg-amber/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-dark ring-1 ring-inset ring-amber/30 transition-all hover:bg-amber/20 cursor-pointer"
            >
              Hoje
            </button>
          )}

          {/* Date picker */}
          <div className="relative">
            <input
              ref={inputRef}
              id="date-nav-picker"
              type="date"
              value={inputValue}
              onChange={handleDateInput}
              className="h-8 w-[130px] rounded-lg border border-slate-200/80 bg-white px-2.5 text-xs font-medium text-slate-600 transition-all hover:border-amber/40 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20"
            />
          </div>
        </div>

        {/* Next button */}
        <button
          id="date-nav-next"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 transition-all duration-200 hover:border-amber/40 hover:text-amber hover:shadow-sm cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
