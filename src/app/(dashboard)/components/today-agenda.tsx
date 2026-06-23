import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface Appointment {
  id: string;
  startsAt: Date;
  status: string;
  client: { name: string };
  barber: { name: string };
  barberService: {
    service: { name: string };
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  CONFIRMED: {
    label: "Confirmado",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  SCHEDULED: {
    label: "Agendado",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-100 text-red-600 border-red-200",
  },
  NO_SHOW: {
    label: "Não compareceu",
    className: "bg-red-50 text-red-500 border-red-100",
  },
};

interface TodayAgendaProps {
  appointments: Appointment[];
}

export function TodayAgenda({ appointments }: TodayAgendaProps) {
  if (appointments.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 pb-10 text-sm text-muted-foreground">
        <Calendar size={45}/>
        <span>Nenhum agendamento para hoje.</span>
      </div>
    );
  }

  return (
    <div className="space-y-0 max-h-65 overflow-y-auto pr-1 custom-scrollbar">
      {appointments.map((appointment) => {
        const time = new Date(appointment.startsAt).toLocaleTimeString(
          "pt-BR",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        const status = statusConfig[appointment.status] ?? {
          label: appointment.status,
          className: "bg-gray-100 text-gray-600",
        };

        return (
          <div
            key={appointment.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
          >
            {/* Time */}
            <span className="w-12 shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">
              {time}
            </span>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {appointment.client.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {appointment.barber.name} · {appointment.barberService.service.name}
              </p>
            </div>

            {/* Status */}
            <Badge
              variant="outline"
              className={`shrink-0 text-[11px] font-medium ${status.className}`}
            >
              {status.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
