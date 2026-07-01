import { LayoutDashboard } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Header } from "@/app/(dashboard)/components/topbar";

import {
  getBarberStats,
  getClientsCount,
  getTodayStats,
  getLast7DaysAppointments,
  getRecentAppointments,
} from "@/lib/dashboard";

import { StatsCards } from "./components/stats-cards";
import { AppointmentsChart } from "./components/appointments-chart";
import { TodayAgenda } from "./components/today-agenda";
import { RecentAppointments } from "./components/recent-appointments";
import { getAppointmentsByDate } from "@/lib/appointments";
import { serializeAppointment } from "@/utils/serializers";

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [barberStats, totalClients, todayStats, todayAppointments, chartData, recentAppointments] =
    await Promise.all([
      getBarberStats(),
      getClientsCount(),
      getTodayStats(),
      getAppointmentsByDate(new Date()),
      getLast7DaysAppointments(),
      getRecentAppointments(5),
    ]);

  // Format today's date in Portuguese
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const serializedTodayAppointments = todayAppointments.map(serializeAppointment);
  const serializedRecentAppointments = recentAppointments.map(serializeAppointment);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <Header icon={LayoutDashboard} span="DASHBOARD" />

      {/* Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Section Header */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Visão Geral</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{today}</p>
        </div>

        {/* Top Row: KPI Cards */}
        <StatsCards
          activeBarbers={barberStats.active}
          totalBarbers={barberStats.total}
          totalClients={totalClients}
          todayAppointments={todayStats.total}
          completedAppointments={todayStats.completed}
          estimatedRevenue={todayStats.estimatedRevenue}
        />

        {/* Middle Row: Chart and Agenda */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Bar Chart */}
          <Card className="xl:col-span-9 border-none shadow-glass hover:shadow-soft transition-shadow ring-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] sm:text-sm font-bold text-foreground uppercase tracking-wide">
                Agendamentos — Últimos 7 Dias
              </CardTitle>
            </CardHeader>

            <CardContent>
              <AppointmentsChart data={chartData} />
            </CardContent>
          </Card>

          {/* Today Agenda */}
          <Card className="xl:col-span-3 border-none shadow-glass hover:shadow-soft transition-shadow ring-0 flex flex-col h-85">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] sm:text-sm font-bold text-foreground uppercase tracking-wide">
                Agenda de Hoje
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden">
              <TodayAgenda appointments={serializedTodayAppointments} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Recent Appointments */}
        <Card className="border-none shadow-glass hover:shadow-soft transition-shadow ring-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px] sm:text-sm font-bold text-foreground uppercase tracking-wide">
              Agendamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAppointments appointments={serializedRecentAppointments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
