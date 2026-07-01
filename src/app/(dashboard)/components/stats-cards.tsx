import { formatCurrency } from "@/utils/formaters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Scissors, Users, CalendarDays, DollarSign } from "lucide-react";

interface StatsCardsProps {
  activeBarbers: number;
  totalBarbers: number;
  totalClients: number;
  todayAppointments: number;
  completedAppointments: number;
  estimatedRevenue: number;
}

export function StatsCards({
  activeBarbers,
  totalBarbers,
  totalClients,
  todayAppointments,
  completedAppointments,
  estimatedRevenue,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Barbeiros */}
      <Card className="border-0 border-t-4 border-t-amber-500 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Barbeiros Ativos
          </CardTitle>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Scissors className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-[28px] font-bold tracking-tight text-foreground leading-none">
            {activeBarbers}
          </p>

          <CardDescription className="mt-1 text-xs">
            {totalBarbers} cadastrados
          </CardDescription>
        </CardContent>
      </Card>

      {/* Clientes */}
      <Card className="border-0 border-t-4 border-t-blue-500 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Clientes
          </CardTitle>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-[28px] font-bold tracking-tight text-foreground leading-none">
            {totalClients}
          </p>

          <CardDescription className="mt-1 text-xs">
            Base cadastrada
          </CardDescription>
        </CardContent>
      </Card>

      {/* Agendamentos */}
      <Card className="border-0 border-t-4 border-t-green-500 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agendamentos
          </CardTitle>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
            <CalendarDays className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-[28px] font-bold tracking-tight text-foreground leading-none">
            {todayAppointments}
          </p>

          <CardDescription className="mt-1 text-xs">
            {completedAppointments} concluídos
          </CardDescription>
        </CardContent>
      </Card>

      {/* Receita */}
      <Card className="relative overflow-hidden border-0 border-t-4 border-t-amber-300 bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

        <CardHeader className="flex flex-row items-start justify-between pb-2 relative z-10">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/90">
            Receita Hoje
          </CardTitle>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <p className="text-[28px] font-bold tracking-tight text-white leading-none">
            {formatCurrency(estimatedRevenue)}
          </p>

          <CardDescription className="mt-1 text-xs text-white/75">
            Estimativa total
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}