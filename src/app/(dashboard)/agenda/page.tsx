import { Suspense } from "react";
import { Header } from "@/app/(dashboard)/components/topbar";
import { CalendarRange } from "lucide-react";
import { getActiveBarbers, getAppointmentsByDateRange } from "@/lib/appointments";
import { AgendaClient } from "./components/agenda-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse date from search params or use today
  const dateParam = typeof params.date === "string" ? params.date : undefined;
  let selectedDate = new Date();
  if (dateParam) {
    const parsedDate = new Date(dateParam + "T12:00:00");
    if (!isNaN(parsedDate.getTime())) {
      selectedDate = parsedDate;
    }
  }

  // Determine view mode
  const viewMode = typeof params.view === "string" ? params.view : "week";

  // Calculate start and end date based on viewMode
  let startDate = new Date(selectedDate);
  let endDate = new Date(selectedDate);

  if (viewMode === "month") {
    // Start of month grid (Sunday before or on 1st of month)
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    
    // End of month grid (Saturday after or on last day of month)
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
  } else {
    // Week view
    const dayOfWeek = selectedDate.getDay();
    startDate.setDate(selectedDate.getDate() - dayOfWeek);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  }

  // Parse barber filter
  const barberId = typeof params.barber === "string" ? params.barber : undefined;

  // Fetch data in parallel
  const [barbers, appointments] = await Promise.all([
    getActiveBarbers(),
    getAppointmentsByDateRange(startDate, endDate, barberId),
  ]);

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

  const currentDateISO = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header icon={CalendarRange} span="AGENDA" />

      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={null}>
          <AgendaClient
            barbers={barbers}
            appointments={serializedAppointments}
            currentDate={currentDateISO}
            activeBarberId={barberId ?? null}
            initialViewMode={viewMode as "week" | "month"}
          />
        </Suspense>
      </div>
    </div>
  );
}
