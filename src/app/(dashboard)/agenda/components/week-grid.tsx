"use client";

import { useMemo } from "react";
import { STATUS_CONFIG } from "@/app/(dashboard)/appointments/components/status-legend";

interface Appointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  client: { name: string };
  barberService: {
    service: { name: string };
  };
}

interface WeekGridProps {
  startDate: Date; // Sunday
  appointments: Appointment[];
  onAppointmentClick: (id: string) => void;
  startHour?: number;
  endHour?: number;
}

const HOUR_HEIGHT = 60; // px per hour slot
const SLOT_MINUTES = 60;

export function WeekGrid({
  startDate,
  appointments,
  onAppointmentClick,
  startHour = 7,
  endHour = 23,
}: WeekGridProps) {
  // Generate days of the week
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startDate]);

  // Generate hours array
  const hours = useMemo(() => {
    const arr = [];
    for (let h = startHour; h <= endHour; h++) {
      arr.push(h);
    }
    return arr;
  }, [startHour, endHour]);

  // Group appointments by date string (YYYY-MM-DD)
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    // Initialize groups
    days.forEach(d => {
      const dateStr = d.toISOString().split('T')[0];
      grouped[dateStr] = [];
    });

    appointments.forEach(appt => {
      const dateStr = new Date(appt.startsAt).toISOString().split('T')[0];
      if (grouped[dateStr]) {
        grouped[dateStr].push(appt);
      }
    });

    return grouped;
  }, [appointments, days]);

  function getBlockStyle(appt: Appointment) {
    const start = new Date(appt.startsAt);
    const end = new Date(appt.endsAt);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    const topOffset = ((startMinutes - startHour * 60) / SLOT_MINUTES) * HOUR_HEIGHT;
    const height = (duration / SLOT_MINUTES) * HOUR_HEIGHT;

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 24)}px`, // minimum height
    };
  }

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Scrollable Container for both Header and Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex flex-col custom-scrollbar">

        {/* Header (Days) */}
        <div className="flex border-b border-slate-100 bg-white shrink-0 pl-16 min-w-210">
          {days.map((day, i) => {
            const today = isToday(day);
            return (
              <div key={i} className="flex-1 py-3 text-center border-l border-slate-100 first:border-l-0 relative">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  {day.toLocaleString('pt-BR', { weekday: 'short' })}
                </p>
                <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${today ? 'bg-navy text-white shadow-md' : 'text-slate-700'
                  }`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Body */}
        <div className="flex flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 relative min-w-210">

          {/* Time Labels Column */}
          <div className="w-16 shrink-0 bg-white border-r border-slate-100 sticky left-0 z-20">
            <div className="relative mt-4 mb-4" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
              {hours.map(hour => {
                const top = (hour - startHour) * HOUR_HEIGHT;
                return (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 flex items-start justify-end pr-3 -translate-y-1/2"
                    style={{ top: `${top}px` }}
                  >
                    <span className="text-[10px] font-medium text-slate-400 tabular-nums tracking-tight">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Days Columns */}
          <div className="flex flex-1 relative">
            {/* Horizontal lines for hours (across all columns) */}
            <div className="absolute inset-0 pointer-events-none mt-4 mb-4">
              {hours.map(hour => {
                const top = (hour - startHour) * HOUR_HEIGHT;
                return (
                  <div
                    key={`line-${hour}`}
                    className="absolute left-0 right-0 border-t border-slate-200/50"
                    style={{ top: `${top}px` }}
                  />
                );
              })}
              {/* Half-hour dashed lines */}
              {hours.slice(0, -1).map(hour => {
                const top = (hour - startHour) * HOUR_HEIGHT + HOUR_HEIGHT / 2;
                return (
                  <div
                    key={`half-${hour}`}
                    className="absolute left-0 right-0 border-t border-dashed border-slate-200/30"
                    style={{ top: `${top}px` }}
                  />
                );
              })}
            </div>

            {/* Columns */}
            {days.map((day, i) => {
              const dateStr = day.toISOString().split('T')[0];
              const dayAppointments = appointmentsByDay[dateStr] || [];

              return (
                <div key={i} className="flex-1 relative border-l border-slate-100 first:border-l-0">
                  <div className="relative w-full h-full mt-4 mb-4">
                    {dayAppointments.map((appt) => {
                      const style = getBlockStyle(appt);

                      const height = parseFloat(style.height);

                      const veryCompact = height < 30;
                      const compact = height < 46;
                      const showService = height >= 30;

                      const statusKey = appt.status as keyof typeof STATUS_CONFIG;
                      const statusCfg =
                        STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.SCHEDULED;

                      const startTime = new Date(appt.startsAt).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <button
                          key={appt.id}
                          onClick={() => onAppointmentClick(appt.id)}
                          style={style}
                          className={`
                            absolute left-1 right-1 rounded-md
                            text-left overflow-hidden
                            transition-all duration-200
                            cursor-pointer

                            ${compact ? "p-1" : "p-1.5"}

                            ${statusCfg.colorLight}
                            ${statusCfg.textColor}
                            border-l-[3px]
                            ${statusCfg.borderColor}

                            hover:shadow-md
                            hover:brightness-95
                            hover:z-10

                            shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                          `}
                        >
                          <div
                            className={`
                              flex h-full overflow-hidden

                              ${veryCompact
                                ? "flex-row items-center gap-1 whitespace-nowrap"
                                : "flex-col justify-center"
                              }
                            `}
                          >
                            <p
                              className={`
                                font-semibold
                                leading-tight
                                truncate
                                whitespace-nowrap

                                ${veryCompact ? "text-[10px]" : compact ? "text-[11px]" : "text-[12px]"}
                              `}
                            >
                              {appt.client.name}
                            </p>

                            <p
                              className={`
                                truncate
                                whitespace-nowrap
                                opacity-75
                                leading-tight

                                ${veryCompact ? "text-[10px]" : compact ? "text-[9px]" : "text-[10px]"}
                              `}
                            >
                              {veryCompact ? (
                                <>- {startTime}</>
                              ) : (
                                <>
                                  {showService && (
                                    <>
                                      {appt.barberService.service.name}
                                      {" • "}
                                    </>
                                  )}
                                  {startTime}
                                </>
                              )}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
