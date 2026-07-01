"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, UserX, AlertTriangle } from "lucide-react";
import { AppointmentModalManager } from "../appointments/components/appointment-modal-manager";

import { Appointment } from "@/utils/types";
import { STATUS_CONFIG, type AppointmentStatusKey } from "../appointments/components/status-legend";
import { isAppointmentOverdue } from "@/utils/formaters";
import { updateAppointmentStatusAction } from "../appointments/actions";

interface TodayAgendaProps {
  appointments: Appointment[];
}

export function TodayAgenda({ appointments: initialAppointments }: TodayAgendaProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (appointments.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 pb-10 text-sm text-muted-foreground">
        <Calendar size={45}/>
        <span>Nenhum agendamento para hoje.</span>
      </div>
    );
  }

  const handleOpenModal = (appointment: Appointment) => {
    setSelectedAppointment({
      ...appointment,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
    });
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setSelectedAppointment((prev: any) =>
      prev ? { ...prev, status: newStatus } : prev
    );
  };

  const handleQuickAction = (e: React.MouseEvent, appointment: Appointment, status: "COMPLETED" | "NO_SHOW") => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(appointment.id, status);
      if (result.success) {
        handleStatusChange(appointment.id, status);
      }
    });
  };

  return (
    <>
      <div className="space-y-0 max-h-65 overflow-y-auto pr-1 custom-scrollbar">
        {appointments.map((appointment) => {
          const time = new Date(appointment.startsAt).toLocaleTimeString(
            "pt-BR",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );

          const overdue = isAppointmentOverdue(appointment);

          const status = STATUS_CONFIG[appointment.status as AppointmentStatusKey] ?? {
            label: appointment.status,
            colorLight: "bg-gray-100",
            textColor: "text-gray-600",
            borderColor: "border-gray-200"
          };

          return (
            <div
              key={appointment.id}
              onClick={() => handleOpenModal(appointment)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
                overdue
                  ? "bg-orange-50/70 hover:bg-orange-100/60 border border-orange-200/60"
                  : "hover:bg-muted/50"
              }`}
            >
              {/* Time + overdue icon */}
              <span className={`w-12 shrink-0 text-sm font-semibold tabular-nums flex flex-col items-start ${overdue ? "text-orange-600" : ""}`}>
                {overdue
                  ? <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mb-0.5" />
                  : null
                }
                {time}
              </span>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${overdue ? "text-orange-700" : "text-foreground"}`}>
                  {appointment.client.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {appointment.barber.name} · {appointment.barberService.service.name}
                </p>
              </div>

              {/* Quick actions for overdue, or badge for normal */}
              {overdue ? (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    title="Marcar como Concluído"
                    disabled={isPending}
                    onClick={(e) => handleQuickAction(e, appointment, "COMPLETED")}
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Marcar como Não Compareceu"
                    disabled={isPending}
                    onClick={(e) => handleQuickAction(e, appointment, "NO_SHOW")}
                    className="flex items-center justify-center h-7 w-7 rounded-md bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[11px] font-medium border ${status.colorLight} ${status.textColor} ${status.borderColor}`}
                >
                  {status.label}
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Shared Detail Modal */}
      <AppointmentModalManager
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment as any}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
