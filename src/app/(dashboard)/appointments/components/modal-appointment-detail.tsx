"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  User,
  Scissors,
  DollarSign,
  FileText,
  Trash2,
  Loader2,
  Edit2,
} from "lucide-react";
import { ModalBarber } from "@/app/(dashboard)/components/modal-barber";
import {
  updateAppointmentStatusAction,
  deleteAppointmentAction,
  type AppointmentStatus,
} from "../actions";
import {
  STATUS_CONFIG,
  type AppointmentStatusKey,
} from "./status-legend";

import { Appointment } from "@/utils/types";

interface ModalAppointmentDetailProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit?: () => void;
  isFetchingEdit?: boolean;
}

const STATUS_OPTIONS: { key: AppointmentStatus; label: string }[] = [
  { key: "SCHEDULED", label: "Agendado" },
  { key: "CONFIRMED", label: "Confirmado" },
  { key: "COMPLETED", label: "Concluído" },
  { key: "CANCELLED", label: "Cancelado" },
  { key: "NO_SHOW", label: "Não Compareceu" },
];

export function ModalAppointmentDetail({
  isOpen,
  onClose,
  appointment,
  onEdit,
  isFetchingEdit = false,
}: ModalAppointmentDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  // appointment is guaranteed non-null from here
  const appt = appointment;

  const statusKey = appt.status as AppointmentStatusKey;
  const statusCfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.SCHEDULED;

  const startTime = new Date(appt.startsAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(appt.endsAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateFormatted = new Date(appt.startsAt).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "2-digit", year: "numeric" }
  );
  const durationMins = appt.barberService.durationMinutes;

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function handleStatusChange(newStatus: AppointmentStatus) {
    if (newStatus === appt.status) return;
    setError(null);

    startTransition(async () => {
      const res = await updateAppointmentStatusAction(appt.id, newStatus);
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || "Erro ao atualizar o status.");
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Deseja realmente remover este agendamento? Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;
    setError(null);

    startTransition(async () => {
      const res = await deleteAppointmentAction(appt.id);
      if (res.success) {
        onClose();
        router.refresh();
      } else {
        setError(res.error || "Erro ao remover o agendamento.");
      }
    });
  }

  return (
    <ModalBarber
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhe do Agendamento"
      icon={CalendarDays}
      disabled={isPending}
      maxWidthClass="max-w-lg"
    >
      <div className="flex flex-col">
        {/* Client Hero */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber/20 to-amber/5 text-amber font-bold text-sm border border-amber/20">
              {getInitials(appt.client.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-navy leading-tight truncate">
                {appt.client.name}
              </p>
              {appt.client.phone && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {appt.client.phone}
                </p>
              )}
            </div>
            {/* Status Badge */}
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${statusCfg.colorLight} ${statusCfg.textColor} ring-1 ring-inset ${statusCfg.borderColor}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.color}`} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-3">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Info Rows */}
          <DetailRow
            icon={User}
            label="Barbeiro"
            value={appt.barber.name}
          />
          <DetailRow
            icon={Scissors}
            label="Serviço"
            value={appt.barberService.service.name}
          />
          <DetailRow
            icon={CalendarDays}
            label="Horário"
            value={`${dateFormatted} · ${startTime} – ${endTime}`}
          />
          <DetailRow
            icon={Clock}
            label="Duração"
            value={`${durationMins} min`}
          />
          <DetailRow
            icon={DollarSign}
            label="Valor"
            value={`R$ ${Number(appt.barberService.price).toLocaleString(
              "pt-BR",
              { minimumFractionDigits: 2 }
            )}`}
          />

          {/* Notes */}
          {appt.notes && (
            <div className="flex items-start gap-3 pt-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 mt-0.5">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                  Observações
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                  {appt.notes}
                </p>
              </div>
            </div>
          )}

          {/* Status Selector */}
          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = appt.status === opt.key;
                const cfg = STATUS_CONFIG[opt.key];
                return (
                  <button
                    key={opt.key}
                    type="button"
                    id={`status-btn-${opt.key.toLowerCase()}`}
                    disabled={isPending}
                    onClick={() => handleStatusChange(opt.key)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold
                      border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                      ${isActive
                        ? `${cfg.colorLight} ${cfg.textColor} ${cfg.borderColor} ring-1 ring-inset ${cfg.ringColor} shadow-sm`
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isActive ? cfg.color : "bg-slate-300"}`}
                    />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100 mt-2">
          {/* Delete (Left Side) */}
          <button
            type="button"
            id="btn-delete-appointment"
            disabled={isPending}
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remover
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                id="btn-edit-appointment"
                disabled={isPending || isFetchingEdit}
                onClick={onEdit}
                className="px-4 py-2 text-sm font-bold text-navy-dark bg-linear-to-r from-amber to-amber-light hover:brightness-110 rounded-lg transition-all flex items-center gap-2 justify-center cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isFetchingEdit ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalBarber>
  );
}

// ─── Sub-component ───────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-navy truncate">{value}</p>
      </div>
    </div>
  );
}
