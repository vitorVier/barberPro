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

interface MonthGridProps {
  currentDate: Date; // A date within the current month being viewed
  appointments: Appointment[];
  onAppointmentClick: (id: string) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthGrid({
  currentDate,
  appointments,
  onAppointmentClick,
  onDayClick,
}: MonthGridProps) {
  
  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    
    const endDate = new Date(lastDayOfMonth);
    if (lastDayOfMonth.getDay() !== 6) {
      endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
    }
    
    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  // Group appointments by date string (YYYY-MM-DD)
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach(appt => {
      const dateStr = new Date(appt.startsAt).toISOString().split('T')[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(appt);
    });

    return grouped;
  }, [appointments]);

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (d: Date) => {
    return d.getMonth() === currentDate.getMonth();
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header (Days of week) */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 shrink-0">
        {weekDays.map((day, i) => (
          <div key={i} className="py-2 text-center border-l border-slate-100 first:border-l-0">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
        {calendarDays.map((day, i) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayAppointments = appointmentsByDay[dateStr] || [];
          
          // Show up to 3 appointments, then "+X mais"
          const maxVisible = 3;
          const visibleAppointments = dayAppointments.slice(0, maxVisible);
          const hiddenCount = dayAppointments.length - maxVisible;
          
          const today = isToday(day);
          const currentMonth = isCurrentMonth(day);

          return (
            <div 
              key={i} 
              onClick={() => onDayClick?.(day)}
              className={`bg-white min-h-25 p-1 flex flex-col transition-colors hover:bg-slate-50/50 cursor-pointer ${!currentMonth ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-center mb-1">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold ${
                  today ? 'bg-navy text-white shadow-sm' : 'text-slate-600'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
                {visibleAppointments.map(appt => {
                  const statusKey = appt.status as keyof typeof STATUS_CONFIG;
                  const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.SCHEDULED;
                  const startTime = new Date(appt.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <button
                      key={appt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appt.id);
                      }}
                      className={`
                        w-full text-left rounded px-1.5 py-1 text-[10px] leading-tight transition-all
                        ${statusCfg.colorLight} ${statusCfg.textColor} border-l-2 ${statusCfg.borderColor}
                        hover:brightness-95 cursor-pointer truncate
                      `}
                      title={`${startTime} - ${appt.client.name} (${appt.barberService.service.name})`}
                    >
                      <span className="font-semibold">{startTime}</span> <span className="opacity-90">{appt.client.name}</span>
                    </button>
                  );
                })}
                
                {hiddenCount > 0 && (
                  <div className="text-[10px] text-slate-400 font-medium text-center mt-0.5">
                    +{hiddenCount} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
