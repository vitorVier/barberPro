import { Suspense } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Header } from "@/app/(dashboard)/components/topbar";
import { getActiveBarbers, getAppointmentsByDate, getAllClients, getAllBarberServices } from "@/lib/appointments";
import { BarberTabs } from "./components/barber-tabs";
import { DateNavigator } from "./components/date-navigator";
import { StatusLegend } from "./components/status-legend";
import { TimelineGrid } from "./components/timeline-grid";
import { EmptyState } from "./components/empty-state";
import { NewAppointmentWrapper } from "./components/new-appointment-wrapper";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse date from search params or use today
  const dateParam =
    typeof params.date === "string" ? params.date : undefined;
  const selectedDate = dateParam
    ? new Date(dateParam + "T12:00:00")
    : new Date();

  // Use local timezone formatting to avoid UTC offset issues at night
  const dateISO =
    dateParam ||
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  // Parse barber filter
  const barberId =
    typeof params.barber === "string" ? params.barber : undefined;

  // Fetch data in parallel
  const [barbers, appointments, clients, allServices] = await Promise.all([
    getActiveBarbers(),
    getAppointmentsByDate(selectedDate, barberId),
    getAllClients(),
    getAllBarberServices(),
  ]);

  // Count by status
  const statusCounts = appointments.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Format the current date for display
  const formattedDate = selectedDate.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });

  // Serialize appointments for the client component
  const serializedAppointments = appointments.map((a) => ({
    ...a,
    startsAt: a.startsAt.toISOString(),
    endsAt: a.endsAt.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    barberService: {
      ...a.barberService,
      price: Number(a.barberService.price),
      createdAt: a.barberService.createdAt.toISOString(),
      service: a.barberService.service,
    },
  }));

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Top Bar */}
      <Header icon={CalendarDays} span="AGENDAMENTOS" />

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 gap-4 sm:gap-5 p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Page Header Row */}
        <div className="shrink-0 flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Agendamentos
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-navy">
                {appointments.length}
              </span>{" "}
              {appointments.length === 1 ? "agendamento" : "agendamentos"} em{" "}
              {formattedDate}
            </p>
          </div>

          {/* New Appointment CTA */}
          <NewAppointmentWrapper
            barbers={barbers}
            clients={clients}
            barberServices={allServices}
            currentDate={dateISO}
            currentBarberId={barberId}
          />
        </div>

        {/* Barber Filter Tabs */}
        <div className="shrink-0">
          <Suspense fallback={null}>
            <BarberTabs barbers={barbers} activeId={barberId ?? null} />
          </Suspense>
        </div>

        {/* Main Timeline Card */}
        <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          {/* Card Header: Date Nav + Legend */}
          <div className="shrink-0 flex flex-col gap-3 sm:gap-4 border-b border-slate-100 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 sm:flex-row sm:items-center sm:justify-between">
            <Suspense fallback={null}>
              <DateNavigator currentDate={dateISO} />
            </Suspense>
            <StatusLegend />
          </div>

          {/* Quick Stats Pills */}
          {appointments.length > 0 && (
            <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 border-b border-slate-50 bg-slate-50/50 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Resumo:
              </span>
              {Object.entries(statusCounts).map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80"
                >
                  {count}{" "}
                  {status === "SCHEDULED"
                    ? "Agendado"
                    : status === "CONFIRMED"
                      ? "Confirmado"
                      : status === "COMPLETED"
                        ? "Concluído"
                        : status === "CANCELLED"
                          ? "Cancelado"
                          : "Não Compareceu"}
                  {Number(count) !== 1 ? "s" : ""}
                </span>
              ))}
            </div>
          )}

          {/* Timeline or Empty State */}
          <div className="flex-1 flex flex-col min-h-0 relative bg-slate-50/30">
            {appointments.length > 0 ? (
              <TimelineGrid appointments={serializedAppointments} />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <EmptyState />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}