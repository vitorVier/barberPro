"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { AppointmentModalManager } from "../appointments/components/appointment-modal-manager";

import { Appointment } from "@/utils/types";

import { STATUS_CONFIG, type AppointmentStatusKey } from "../appointments/components/status-legend";

interface TodayAgendaProps {
  appointments: Appointment[];
}

export function TodayAgenda({ appointments }: TodayAgendaProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleStatusChange = (_id: string, newStatus: string) => {
    setSelectedAppointment((prev: any) =>
      prev ? { ...prev, status: newStatus } : prev
    );
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
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
            >
              {/* Time */}
              <span className="w-12 shrink-0 text-sm font-semibold  tabular-nums">
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
                className={`shrink-0 text-[11px] font-medium border ${status.colorLight} ${status.textColor} ${status.borderColor}`}
              >
                {status.label}
              </Badge>
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
