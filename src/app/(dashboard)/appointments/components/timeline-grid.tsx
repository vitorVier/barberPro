"use client";

import { useState } from "react";
import {
  MoreHorizontal,
} from "lucide-react";
import {
  STATUS_CONFIG,
} from "./status-legend";
import { AppointmentModalManager } from "./appointment-modal-manager";

import { Appointment } from "@/utils/types";

interface TimelineGridProps {
  appointments: Appointment[];
  startHour?: number;
  endHour?: number;
}

const HOUR_HEIGHT = 80; // px per hour slot
const SLOT_MINUTES = 60;

export function TimelineGrid({
  appointments,
  startHour = 7,
  endHour = 23,
}: TimelineGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleOpenDetail(apptId: string) {
    setSelectedId(apptId);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedId(null);
  }

  // Current time indicator
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const showNowLine =
    nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;
  const nowTop =
    ((nowMinutes - startHour * 60) / SLOT_MINUTES) * HOUR_HEIGHT;

  return (
    <div className="relative flex flex-col flex-1 min-h-0 w-full h-full">
      {/* Timeline container */}
      <div
        className="relative flex flex-1 min-h-0 overflow-y-auto custom-scrollbar"
      >
        {/* Time labels column */}
        <div className="sticky left-0 z-10 w-18 shrink-0 bg-white border-r border-slate-100">
          <div className="relative mt-4 mb-4" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
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
            className="relative mt-4 mb-4"
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
                <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm ml-1.5" />
                <div className="flex-1 h-px bg-red-500/50" />
              </div>
            )}

            {/* Appointment blocks */}
            <div className="absolute inset-0 px-2 sm:px-3">
              {appointments.map((appt) => {
                const style = getBlockStyle(appt);
                const statusKey = appt.status as keyof typeof STATUS_CONFIG;
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
                const isCompact = durationMins <= 45; // Use compact mode for appointments 45m or less to prevent overlap

                return (
                  <button
                    key={appt.id}
                    id={`appointment-block-${appt.id}`}
                    onClick={() => handleOpenDetail(appt.id)}
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
                        <p className={`text-[11px] font-medium ${statusCfg.textColor} truncate w-full flex items-center gap-1.5 z-10`}>
                          <span className="shrink-0 font-semibold">{startTime} - {endTime}</span>
                          <span className="opacity-40 font-normal shrink-0">|</span>
                          <span className="truncate">
                            {appt.client.name} <span className="opacity-70 font-normal ml-1">- {appt.barberService.service.name}</span>
                          </span>
                        </p>
                      ) : (
                        <>
                          <p className={`text-sm font-semibold ${statusCfg.textColor} truncate leading-tight w-full z-10 pr-4`}>
                            {appt.client.name}
                          </p>
                          <p className={`text-[11px] ${statusCfg.textColor} opacity-80 truncate mt-0.5 w-full z-10`}>
                            {appt.barberService.service.name}
                          </p>
                          <p className={`text-[10px] ${statusCfg.textColor} opacity-70 font-medium mt-auto w-full tabular-nums z-10`}>
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

      {/* Appointment Detail & Edit Modal Manager */}
      <AppointmentModalManager
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment ?? null}
      />
    </div>
  );
}
