"use client";

import { useState, useRef, useEffect } from "react";
import {
  Clock,
  User,
  Scissors,
  Phone,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  STATUS_CONFIG,
  type AppointmentStatusKey,
} from "./status-legend";

interface Appointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  notes: string | null;
  barber: { id: string; name: string; avatarUrl: string | null };
  client: { id: string; name: string; phone: string | null };
  barberService: {
    price: unknown;
    durationMinutes: number;
    service: { name: string };
  };
}

interface TimelineGridProps {
  appointments: Appointment[];
  startHour?: number;
  endHour?: number;
}

const HOUR_HEIGHT = 80; // px per hour slot
const SLOT_MINUTES = 60;

export function TimelineGrid({
  appointments,
  startHour = 8,
  endHour = 20,
}: TimelineGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (detailRef.current && !detailRef.current.contains(e.target as Node)) {
        setSelectedId(null);
      }
    }
    if (selectedId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedId]);

  // Generate time slots
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  // Calculate position and height for appointment blocks
  function getBlockStyle(appt: Appointment) {
    const start = new Date(appt.startsAt);
    const end = new Date(appt.endsAt);

    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = endMinutes - startMinutes;

    const topOffset =
      ((startMinutes - startHour * 60) / SLOT_MINUTES) * HOUR_HEIGHT;
    const height = (duration / SLOT_MINUTES) * HOUR_HEIGHT;

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 36)}px`, // minimum 36px height
    };
  }

  const selectedAppointment = appointments.find((a) => a.id === selectedId);

  // Current time indicator
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine =
    nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;
  const nowTop =
    ((nowMinutes - startHour * 60) / SLOT_MINUTES) * HOUR_HEIGHT;

  return (
    <div className="relative flex flex-col">
      {/* Timeline container */}
      <div
        ref={timelineRef}
        className="relative flex overflow-y-auto max-h-[calc(100vh-360px)] min-h-[480px] custom-scrollbar"
      >
        {/* Time labels column */}
        <div className="sticky left-0 z-10 w-[72px] shrink-0 bg-white border-r border-slate-100">
          <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
            {hours.map((hour) => {
              const top = (hour - startHour) * HOUR_HEIGHT;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start justify-end pr-3 -translate-y-1/2"
                  style={{ top: `${top}px` }}
                >
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums tracking-tight">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid area */}
        <div className="relative flex-1 min-w-0">
          {/* Hour lines */}
          <div
            className="relative"
            style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
          >
            {hours.map((hour) => {
              const top = (hour - startHour) * HOUR_HEIGHT;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-slate-100/50"
                  style={{ top: `${top}px` }}
                />
              );
            })}

            {/* Half-hour dashed lines */}
            {hours.slice(0, -1).map((hour) => {
              const top = (hour - startHour) * HOUR_HEIGHT + HOUR_HEIGHT / 2;
              return (
                <div
                  key={`half-${hour}`}
                  className="absolute left-0 right-0 border-t border-dashed border-slate-100/30"
                  style={{ top: `${top}px` }}
                />
              );
            })}

            {/* Now indicator */}
            {showNowLine && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                style={{ top: `${nowTop}px` }}
              >
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm ml-[6px]" />
                <div className="flex-1 h-px bg-red-500/50" />
              </div>
            )}

            {/* Appointment blocks */}
            <div className="absolute inset-0 px-2 sm:px-3">
              {appointments.map((appt) => {
                const style = getBlockStyle(appt);
                const statusKey = appt.status as AppointmentStatusKey;
                const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.SCHEDULED;
                const isSelected = selectedId === appt.id;

                const startTime = new Date(appt.startsAt).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" }
                );
                const endTime = new Date(appt.endsAt).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" }
                );

                const start = new Date(appt.startsAt);
                const end = new Date(appt.endsAt);
                const durationMins = (end.getTime() - start.getTime()) / 60000;
                const isCompact = durationMins <= 30; // Use compact mode for short appointments

                return (
                  <button
                    key={appt.id}
                    id={`appointment-block-${appt.id}`}
                    onClick={() => setSelectedId(isSelected ? null : appt.id)}
                    className={`
                        absolute left-2 right-2 sm:left-3 sm:right-3 rounded-lg border-l-[3px] 
                        text-left transition-all duration-200 cursor-pointer group overflow-hidden
                        ${statusCfg.borderColor} ${statusCfg.colorLight}
                        ${isSelected
                        ? `shadow-md shadow-slate-200/50 ring-1 ${statusCfg.ringColor} z-10`
                        : `hover:shadow-sm hover:z-10`
                      }
                      `}
                    style={style}
                  >
                    <div className={`flex w-full h-full ${isCompact ? 'flex-row items-center px-3' : 'flex-col items-start px-3 py-2'} gap-1 relative`}>
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-transparent to-white/20`} />

                      {isCompact ? (
                        <p className={`text-xs font-semibold ${statusCfg.textColor} truncate w-full flex items-center gap-1.5 z-10`}>
                          <span className="shrink-0">{startTime}</span>
                          <span className="opacity-40 font-normal shrink-0">|</span>
                          <span className="truncate">
                            {appt.client.name} <span className="opacity-70 font-normal ml-1">- {appt.barberService.service.name}</span>
                          </span>
                        </p>
                      ) : (
                        <>
                          <p className={`text-sm font-bold ${statusCfg.textColor} truncate leading-tight w-full z-10 pr-4`}>
                            {appt.client.name}
                          </p>
                          <p className={`text-xs ${statusCfg.textColor} opacity-80 truncate mt-0.5 w-full z-10`}>
                            {appt.barberService.service.name}
                          </p>
                          <p className={`text-[11px] ${statusCfg.textColor} opacity-70 font-medium mt-auto w-full tabular-nums z-10`}>
                            {startTime} – {endTime}
                          </p>
                        </>
                      )}

                      {/* More button (only in normal mode to save space) */}
                      {!isCompact && (
                        <div className="absolute top-2 right-2 shrink-0 z-10">
                          <MoreHorizontal className={`h-4 w-4 ${statusCfg.textColor} opacity-0 group-hover:opacity-50 transition-opacity`} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Popover / Slide Panel */}
      {selectedAppointment && (
        <div
          ref={detailRef}
          className="absolute right-4 top-4 z-30 w-[340px] rounded-2xl bg-white border border-slate-200/80 shadow-2xl shadow-slate-200/50 overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200"
        >
          {/* Header */}
          <div className="relative px-5 pt-5 pb-4 border-b border-slate-100">
            <button
              id="close-appointment-detail"
              onClick={() => setSelectedId(null)}
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber/15 to-amber/5 text-amber font-bold text-sm border border-amber/20">
                {selectedAppointment.client.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-navy">
                  {selectedAppointment.client.name}
                </p>
                {selectedAppointment.client.phone && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />
                    {selectedAppointment.client.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Status badge */}
            {(() => {
              const sk = selectedAppointment.status as AppointmentStatusKey;
              const sc = STATUS_CONFIG[sk] ?? STATUS_CONFIG.SCHEDULED;
              return (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${sc.colorLight} ${sc.textColor} ring-1 ring-inset ${sc.borderColor}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${sc.color}`} />
                  {sc.label}
                </span>
              );
            })()}
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-3">
            <DetailRow
              icon={Clock}
              label="Horário"
              value={`${new Date(
                selectedAppointment.startsAt
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })} – ${new Date(selectedAppointment.endsAt).toLocaleTimeString(
                "pt-BR",
                { hour: "2-digit", minute: "2-digit" }
              )}`}
            />
            <DetailRow
              icon={Scissors}
              label="Serviço"
              value={selectedAppointment.barberService.service.name}
            />
            <DetailRow
              icon={User}
              label="Barbeiro"
              value={selectedAppointment.barber.name}
            />

            {/* Price */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Valor
              </span>
              <span className="text-base font-bold text-navy">
                R${" "}
                {Number(selectedAppointment.barberService.price).toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 }
                )}
              </span>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div className="rounded-lg bg-slate-50 p-3 mt-2">
                <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  Observações
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component ──────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-navy truncate">{value}</p>
      </div>
    </div>
  );
}
