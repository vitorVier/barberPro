"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusLegend } from "@/app/(dashboard)/appointments/components/status-legend";
import { WeekGrid } from "./week-grid";
import { MonthGrid } from "./month-grid";
import { AppointmentModalManager } from "@/app/(dashboard)/appointments/components/appointment-modal-manager";
import { BarberTabs } from "@/app/(dashboard)/appointments/components/barber-tabs";

import { Appointment, Barber } from "@/utils/types";

interface AgendaClientProps {
  barbers: Barber[];
  appointments: Appointment[];
  currentDate: string; // ISO string YYYY-MM-DD
  activeBarberId: string | null;
  initialViewMode: "week" | "month";
}

export function AgendaClient({
  barbers,
  appointments,
  currentDate,
  activeBarberId,
  initialViewMode,
}: AgendaClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate reference date and ranges
  const refDate = new Date(currentDate + "T12:00:00");
  
  let startDisplayDate = new Date(refDate);
  let endDisplayDate = new Date(refDate);

  if (initialViewMode === "week") {
    startDisplayDate.setDate(startDisplayDate.getDate() - startDisplayDate.getDay());
    endDisplayDate = new Date(startDisplayDate);
    endDisplayDate.setDate(startDisplayDate.getDate() + 6);
  } else {
    startDisplayDate = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    endDisplayDate = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  };

  const startMonth = formatMonth(startDisplayDate);
  const endMonth = formatMonth(endDisplayDate);
  
  let displayDateRange = "";
  if (initialViewMode === "week") {
    displayDateRange = startMonth === endMonth
      ? `${startDisplayDate.getDate()} - ${endDisplayDate.getDate()} De ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} De ${startDisplayDate.getFullYear()}`
      : `${startDisplayDate.getDate()} De ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endDisplayDate.getDate()} De ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} De ${endDisplayDate.getFullYear()}`;
  } else {
    displayDateRange = `${startDisplayDate.toLocaleString("pt-BR", { month: "long" })} De ${startDisplayDate.getFullYear()}`;
  }

  const completedCount = appointments.filter(a => a.status === "COMPLETED").length;

  function navigateDate(direction: 'prev' | 'next') {
    const newDate = new Date(refDate);
    if (initialViewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}-${String(newDate.getDate()).padStart(2, "0")}`);
    router.push(`?${params.toString()}`);
  }

  function toggleViewMode(mode: "week" | "month") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.push(`?${params.toString()}`);
  }

  function handleToday() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    router.push(`?${params.toString()}`);
  }

  function handleBarberChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("barber");
    } else {
      params.set("barber", val);
    }
    router.push(`?${params.toString()}`);
  }

  function handleAppointmentClick(id: string) {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  }

  function handleDayClick(date: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
    params.set("view", "week");
    router.push(`?${params.toString()}`);
  }

  const selectedAppointment = appointments.find(a => a.id === selectedAppointmentId) ?? null;

  // check date
  const date = new Date(currentDate + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();

  const goToToday = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-5 p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-50/30">
      {/* Page Header Row */}
      <div className="shrink-0 flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Agenda
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">
            {displayDateRange}
          </p>
        </div>

        {/* View Toggles */}
        <div className="flex bg-slate-100/80 rounded-lg p-0.5 border border-slate-200/50">
          <button 
            onClick={() => toggleViewMode("week")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${initialViewMode === "week" ? "bg-navy text-white shadow-sm" : "text-slate-500 hover:text-navy hover:bg-slate-200/50"}`}
          >
            Semana
          </button>
          <button 
            onClick={() => toggleViewMode("month")}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${initialViewMode === "month" ? "bg-navy text-white shadow-sm" : "text-slate-500 hover:text-navy hover:bg-slate-200/50"}`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Barber Filter Tabs */}
      <div className="shrink-0">
        <BarberTabs barbers={barbers as any} activeId={activeBarberId} />
      </div>

      {/* Main Timeline Card */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
        
        {/* Card Header: Date Nav + Legend */}
        <div className="shrink-0 flex flex-col gap-3 sm:gap-4 border-b border-slate-100 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronLeft className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
            </button>

            {isToday ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-4.25 py-1.75 text-[12px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-200">
                Hoje
              </span>
            ) : (
              <button
                id="date-nav-today"
                onClick={goToToday}
                className="inline-flex items-center rounded-md bg-amber/10 px-4.25 py-1.75 text-[12px] font-bold text-amber-dark ring-1 ring-inset ring-amber/30 transition-all hover:bg-amber/20 cursor-pointer"
              >
                Voltar para hoje
              </button>
            )}

            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ChevronRight className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
            </button>
          </div>
          
          <StatusLegend />
        </div>

        {/* Quick Stats Pills */}
        {appointments.length > 0 && (
          <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 border-b border-slate-50 bg-slate-50/50 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Resumo:
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80">
              {appointments.length} agendamentos na {initialViewMode === "week" ? "semana" : "visualização"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80">
              {completedCount} concluídos
            </span>
          </div>
        )}

        {/* Grid Component */}
        <div className="flex-1 flex flex-col min-h-0 relative bg-slate-50/30">
          {initialViewMode === "week" ? (
            <WeekGrid 
              startDate={startDisplayDate} 
              appointments={appointments} 
              onAppointmentClick={handleAppointmentClick} 
            />
          ) : (
            <MonthGrid
              currentDate={refDate}
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
              onDayClick={handleDayClick}
            />
          )}
        </div>
      </div>

      {/* Shared Detail Modal */}
      <AppointmentModalManager
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment as any}
      />
    </div>
  );
}
