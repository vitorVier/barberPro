import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  client: { name: string };
  barber: { name: string };
  barberService: {
    price: unknown;
    service: { name: string };
  };
}

const statusConfig: Record<string, { label: string; dotColor: string }> = {
  CONFIRMED: { label: "Confirmado", dotColor: "bg-emerald-500" },
  SCHEDULED: { label: "Agendado", dotColor: "bg-amber-500" },
  COMPLETED: { label: "Concluído", dotColor: "bg-slate-400" },
  CANCELLED: { label: "Cancelado", dotColor: "bg-red-500" },
  NO_SHOW: { label: "Não compareceu", dotColor: "bg-red-400" },
};

interface RecentAppointmentsProps {
  appointments: Appointment[];
}

export function RecentAppointments({
  appointments,
}: RecentAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-b border-border">
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data / Hora
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cliente
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Barbeiro
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Serviço
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Valor
          </TableHead>
          <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => {
          const startsAt = new Date(appointment.startsAt);
          const endsAt = new Date(appointment.endsAt);

          const dateStr = startsAt.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const startTime = startsAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTime = endsAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const price = Number(appointment.barberService.price);
          const status = statusConfig[appointment.status] ?? {
            label: appointment.status,
            dotColor: "bg-gray-400",
          };

          return (
            <TableRow
              key={appointment.id}
              className="border-b border-border/50 hover:bg-muted/30"
            >
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {dateStr}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {startTime} – {endTime}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium text-foreground">
                {appointment.client.name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {appointment.barber.name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {appointment.barberService.service.name}
              </TableCell>
              <TableCell className="text-sm font-medium text-foreground">
                R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="border-transparent bg-transparent text-xs font-medium"
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${status.dotColor} mr-1.5`}
                  />
                  {status.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
