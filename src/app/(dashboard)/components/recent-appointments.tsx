"use client"
import { formatCurrency, isAppointmentOverdue } from "@/utils/formaters";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { STATUS_CONFIG } from "../appointments/components/status-legend";
import { AppointmentModalManager } from "../appointments/components/appointment-modal-manager";
import { useState, useTransition } from "react";

import { Appointment } from "@/utils/types";
import { CheckCircle2, UserX, AlertTriangle } from "lucide-react";
import {
  updateAppointmentStatusAction,
  getRecentAppointmentsByPeriodAction,
  type RecentPeriod,
} from "../appointments/actions";

const PERIOD_OPTIONS: { value: RecentPeriod; label: string }[] = [
  { value: "this_week", label: "Esta semana" },
  { value: "last_week", label: "Semana passada" },
  { value: "last_7_days", label: "Últimos 7 dias" },
  { value: "last_3_days", label: "Últimos 3 dias" },
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
];

interface RecentAppointmentsProps {
  appointments: Appointment[];
}


export function RecentAppointments({
  appointments: initialAppointments,
}: RecentAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isFetching, startFetchTransition] = useTransition();
  const [selectedPeriod, setSelectedPeriod] = useState<RecentPeriod | "">("");

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

  function handleStatusChange(id: string, newStatus: string) {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? {
          ...appointment,
          status: newStatus
        } : appointment
      )
    );
  }

  function handleQuickAction(e: React.MouseEvent, appointment: Appointment, status: "COMPLETED" | "NO_SHOW") {
    e.stopPropagation();
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(appointment.id, status);
      if (result.success) {
        handleStatusChange(appointment.id, status);
      }
    });
  }

  function handlePeriodChange(period: RecentPeriod) {
    setSelectedPeriod(period);
    startFetchTransition(async () => {
      const result = await getRecentAppointmentsByPeriodAction(period);
      if (result.success && result.data) {
        setAppointments(result.data ? result.data as unknown as Appointment[] : []);
      }
    });
  }

  return (
    <>
      {/* Period filter header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">
          {isFetching ? (
            <span className="animate-pulse">Carregando...</span>
          ) : (
            <span>{appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}</span>
          )}
        </p>
        <Select
          value={selectedPeriod}
          onValueChange={(v) => handlePeriodChange(v as RecentPeriod)}
          disabled={isFetching}
        >
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="Filtrar período">
              {PERIOD_OPTIONS.find((item) => item.value === selectedPeriod)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`transition-opacity duration-200 ${isFetching ? "opacity-40 pointer-events-none" : ""}`}>
        {appointments.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Nenhum agendamento encontrado.
          </div>
        ) : (
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
                const overdue = isAppointmentOverdue(appointment);

                return (
                  <TableRow
                    key={appointment.id}
                    onClick={() => handleOpenModal(appointment)}
                    className={`border-b border-border/40 transition-all duration-200 group cursor-pointer ${overdue
                      ? "bg-orange-50/50 hover:bg-orange-50"
                      : "hover:bg-slate-50 hover:shadow-soft"
                      }`}
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
                    <TableCell className={`py-2.5 text-[13px] font-medium ${overdue ? "text-orange-700" : "text-foreground"}`}>
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
                      {overdue ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                          <button
                            title="Marcar como Concluído"
                            disabled={isPending}
                            onClick={(e) => handleQuickAction(e, appointment, "COMPLETED")}
                            className="flex items-center gap-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Concluído
                          </button>
                          <button
                            title="Marcar como Não Compareceu"
                            disabled={isPending}
                            onClick={(e) => handleQuickAction(e, appointment, "NO_SHOW")}
                            className="flex items-center gap-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <UserX className="h-3 w-3" />
                            Faltou
                          </button>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-transparent bg-transparent text-[11px] font-medium px-0"
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${status.color} mr-1.5`}
                          />
                          {status.label}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

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
