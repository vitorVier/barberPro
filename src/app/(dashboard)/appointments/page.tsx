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

  const dateISO = selectedDate.toISOString().split("T")[0];

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
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <Header icon={CalendarDays} span="AGENDAMENTOS" />

      {/* Content */}
      <div className="flex-1 space-y-5 p-6">
        {/* Page Header Row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Agendamentos
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
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
        <Suspense fallback={null}>
          <BarberTabs barbers={barbers} activeId={barberId ?? null} />
        </Suspense>

        {/* Main Timeline Card */}
        <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          {/* Card Header: Date Nav + Legend */}
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Suspense fallback={null}>
              <DateNavigator currentDate={dateISO} />
            </Suspense>
            <StatusLegend />
          </div>

          {/* Quick Stats Pills */}
          {appointments.length > 0 && (
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Resumo:
              </span>
              {Object.entries(statusCounts).map(([status, count]) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/80"
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
          {appointments.length > 0 ? (
            <TimelineGrid appointments={serializedAppointments} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}