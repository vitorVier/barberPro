import { LayoutDashboard, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
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

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [barberStats, totalClients, todayStats, chartData, recentAppointments] =
    await Promise.all([
      getBarberStats(),
      getClientsCount(),
      getTodayStats(),
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <Header icon={LayoutDashboard} span="DASHBOARD" />

      {/* Content */}
      <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Section Header */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Visão Geral</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{today}</p>
        </div>

        {/* Main Grid: Left Column and Right Column */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[1fr_340px]">
          
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* KPI Cards (3 columns) */}
            <StatsCards
              activeBarbers={barberStats.active}
              totalBarbers={barberStats.total}
              totalClients={totalClients}
              todayAppointments={todayStats.total}
              completedAppointments={todayStats.completed}
            />

            {/* Bar Chart */}
            <Card className="border-none shadow-sm ring-0">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Agendamentos — Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentsChart data={chartData} />
              </CardContent>
            </Card>

            {/* Recent Appointments Table */}
            <Card className="border-none shadow-sm ring-0">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Agendamentos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentAppointments appointments={recentAppointments} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Receita Estimada */}
            <Card className="border-none shadow-sm ring-0 bg-amber text-white">
              <CardHeader>
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/80">
                  Receita Estimada Hoje
                </CardTitle>
                <CardAction>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent className="-mt-1">
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  R${" "}
                  {todayStats.estimatedRevenue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <CardDescription className="mt-1 text-xs text-white/70">
                  serviços do dia
                </CardDescription>
              </CardContent>
            </Card>

            {/* Today Agenda */}
            <Card className="border-none shadow-sm ring-0 flex flex-col flex-1">
              <CardHeader>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Agenda de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TodayAgenda appointments={todayStats.appointments} />
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
