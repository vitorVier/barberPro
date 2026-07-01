"use client"
import { formatCurrency } from "@/utils/formaters";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { STATUS_CONFIG } from "../appointments/components/status-legend";
import { AppointmentModalManager } from "../appointments/components/appointment-modal-manager";
import { useState } from "react";

import { Appointment } from "@/utils/types";

interface RecentAppointmentsProps {
  appointments: Appointment[];
}

export function RecentAppointments({
  appointments,
}: RecentAppointmentsProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleOpenModal(appointment: Appointment) {
    setSelectedAppointment({
      ...appointment,
      startsAt: new Date(appointment.startsAt).toISOString(),
      endsAt: new Date(appointment.endsAt).toISOString(),
      barberService: {
        ...appointment.barberService,
        price: Number(appointment.barberService.price)
      }
    });
    setIsModalOpen(true);
  }

  function handleStatusChange(_id: string, newStatus: string) {
    setSelectedAppointment((prev: any) =>
      prev ? { ...prev, status: newStatus } : prev
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <>
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
            const status = STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG] ?? {
              label: appointment.status,
              color: "bg-gray-400",
              textColor: "text-gray-600",
              borderColor: "border-gray-200",
            };

            return (
              <TableRow
                key={appointment.id}
                onClick={() => handleOpenModal(appointment)}
                className="border-b border-border/40 hover:bg-slate-50 hover:shadow-soft transition-all duration-200 group cursor-pointer"
              >
                <TableCell className="py-2.5">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      {dateStr}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {startTime} – {endTime}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 text-[13px] font-medium text-foreground">
                  {appointment.client.name}
                </TableCell>
                <TableCell className="py-2.5 text-[13px] text-muted-foreground">
                  {appointment.barber.name}
                </TableCell>
                <TableCell className="py-2.5 text-[13px] text-muted-foreground">
                  {appointment.barberService.service.name}
                </TableCell>
                <TableCell className="py-2.5 text-[13px] font-semibold text-foreground">
                  {formatCurrency(price)}
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge
                    variant="outline"
                    className="border-transparent bg-transparent text-[11px] font-medium px-0"
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${status.color} mr-1.5`}
                    />
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Shared Detail Modal */}
      <AppointmentModalManager
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment as any}
        onStatusChange={handleStatusChange}
      />
    </>
  )
}
