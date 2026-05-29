import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Scissors, Users, CalendarDays } from "lucide-react";

interface StatsCardsProps {
  activeBarbers: number;
  totalBarbers: number;
  totalClients: number;
  todayAppointments: number;
  completedAppointments: number;
}

export function StatsCards({
  activeBarbers,
  totalBarbers,
  totalClients,
  todayAppointments,
  completedAppointments,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Barbeiros Ativos */}
      <Card className="border-none shadow-sm ring-0">
        <CardHeader>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Barbeiros Ativos
          </CardTitle>
          <CardAction>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber/10">
              <Scissors className="h-4 w-4 text-amber" />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="-mt-1">
          <p className="text-3xl font-bold text-foreground">{activeBarbers}</p>
          <CardDescription className="mt-1 text-xs">
            {totalBarbers} cadastrados no total
          </CardDescription>
        </CardContent>
      </Card>

      {/* Clientes */}
      <Card className="border-none shadow-sm ring-0">
        <CardHeader>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Clientes
          </CardTitle>
          <CardAction>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
              <Users className="h-4 w-4 text-info" />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="-mt-1">
          <p className="text-3xl font-bold text-foreground">{totalClients}</p>
          <CardDescription className="mt-1 text-xs">
            clientes cadastrados
          </CardDescription>
        </CardContent>
      </Card>

      {/* Agendamentos Hoje */}
      <Card className="border-none shadow-sm ring-0">
        <CardHeader>
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agendamentos Hoje
          </CardTitle>
          <CardAction>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <CalendarDays className="h-4 w-4 text-success" />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="-mt-1">
          <p className="text-3xl font-bold text-foreground">
            {todayAppointments}
          </p>
          <CardDescription className="mt-1 text-xs">
            {completedAppointments} concluídos
          </CardDescription>
        </CardContent>
      </Card>


    </div>
  );
}
