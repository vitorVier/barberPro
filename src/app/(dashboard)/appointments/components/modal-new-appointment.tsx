"use client";

import { formatCurrency } from "@/utils/formaters";
import { useState, useTransition, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { createAppointmentAction } from "../actions";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalFooter } from "@/components/ui/modal-footer";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { Barber, ClientBasic, BarberServiceBasic, Appointment } from "@/utils/types";

interface ModalNewAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
  clients: ClientBasic[];
  barberServices: BarberServiceBasic[];
  defaultDate?: string;
  defaultBarberId?: string;
  appointmentToEdit?: Appointment;
}

// ─── helpers ────────────────────────────────────────────────

/** Add `minutesToAdd` to hh:mm and return new { hour, minute } */
function addMinutes(
  hour: string,
  minute: string,
  minutesToAdd: number
): { hour: string; minute: string } {
  const total = parseInt(hour, 10) * 60 + parseInt(minute, 10) + minutesToAdd;
  const clampedTotal = Math.min(total, 23 * 60 + 59); // cap at 23:59
  const h = Math.floor(clampedTotal / 60)
    .toString()
    .padStart(2, "0");
  const m = (clampedTotal % 60).toString().padStart(2, "0");
  return { hour: h, minute: m };
}

/** Returns the duration label (e.g. "1h 30min" or "45 min") */
function formatDuration(startH: string, startM: string, endH: string, endM: string): string | null {
  const startTotal = parseInt(startH, 10) * 60 + parseInt(startM, 10);
  const endTotal = parseInt(endH, 10) * 60 + parseInt(endM, 10);
  const diff = endTotal - startTotal;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins} min`;
}

// ─── constants ──────────────────────────────────────────────

const HOUR_OPTIONS = Array.from({ length: 16 }, (_, i) =>
  (i + 7).toString().padStart(2, "0")
); // 07 → 22

const MINUTE_OPTIONS = ["00", "15", "30", "45"];

// ─── component ──────────────────────────────────────────────

export function ModalNewAppointment({
  isOpen,
  onClose,
  barbers,
  clients,
  barberServices,
  defaultDate,
  defaultBarberId,
  appointmentToEdit,
}: ModalNewAppointmentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [barberId, setBarberId] = useState(defaultBarberId || "");
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");

  // Date as DD/MM/YYYY
  const [dateStr, setDateStr] = useState("");

  // Start time
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");

  // End time (auto-filled from service duration, freely editable)
  const [endHour, setEndHour] = useState("09");
  const [endMinute, setEndMinute] = useState("30");

  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // ── Sync date when modal opens ────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        setBarberId(appointmentToEdit.barberId || appointmentToEdit.barber?.id || "");
        setClientId(appointmentToEdit.clientId || appointmentToEdit.client?.id || "");
        setServiceId(appointmentToEdit.barberServiceId || "");
        setNotes(appointmentToEdit.notes || "");
        
        const start = new Date(appointmentToEdit.startsAt);
        const end = new Date(appointmentToEdit.endsAt);
        
        const day = String(start.getDate()).padStart(2, "0");
        const month = String(start.getMonth() + 1).padStart(2, "0");
        const year = start.getFullYear();
        setDateStr(`${day}/${month}/${year}`);
        
        setStartHour(String(start.getHours()).padStart(2, "0"));
        setStartMinute(String(start.getMinutes()).padStart(2, "0"));
        
        setEndHour(String(end.getHours()).padStart(2, "0"));
        setEndMinute(String(end.getMinutes()).padStart(2, "0"));
      } else {
        if (defaultDate) {
          const parts = defaultDate.split("-");
          if (parts.length === 3) {
            setDateStr(`${parts[2]}/${parts[1]}/${parts[0]}`);
          }
        } else {
          const today = new Date();
          const day = String(today.getDate()).padStart(2, "0");
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const year = today.getFullYear();
          setDateStr(`${day}/${month}/${year}`);
        }
      }
    }
  }, [isOpen, defaultDate, appointmentToEdit]);

  // ── Derived ───────────────────────────────────────────────
  const availableServices = barberServices.filter(
    (bs) => bs.barberId === barberId
  );

  const selectedService = availableServices.find((bs) => bs.id === serviceId);

  const durationLabel = formatDuration(startHour, startMinute, endHour, endMinute);
  const isEndBeforeStart =
    parseInt(endHour, 10) * 60 + parseInt(endMinute, 10) <=
    parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);

  // ── Handlers ─────────────────────────────────────────────

  /** When a service is selected, auto-fill the end time from its default duration */
  function handleServiceChange(id: string) {
    setServiceId(id);
    if (!id) return;
    const svc = availableServices.find((bs) => bs.id === id);
    if (svc?.durationMinutes) {
      const { hour: eh, minute: em } = addMinutes(
        startHour,
        startMinute,
        Number(svc.durationMinutes)
      );
      setEndHour(eh);
      setEndMinute(em);
    }
  }

  /** When start time changes, shift the end time to keep the same duration */
  function handleStartHourChange(val: string | null) {
    if (!val) return;
    const oldStart = parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
    const oldEnd = parseInt(endHour, 10) * 60 + parseInt(endMinute, 10);
    const currentDuration = Math.max(oldEnd - oldStart, 0);

    setStartHour(val);

    if (currentDuration > 0) {
      const { hour: eh, minute: em } = addMinutes(val, startMinute, currentDuration);
      setEndHour(eh);
      setEndMinute(em);
    }
  }

  function handleStartMinuteChange(val: string | null) {
    if (!val) return;
    const oldStart = parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
    const oldEnd = parseInt(endHour, 10) * 60 + parseInt(endMinute, 10);
    const currentDuration = Math.max(oldEnd - oldStart, 0);

    setStartMinute(val);

    if (currentDuration > 0) {
      const { hour: eh, minute: em } = addMinutes(startHour, val, currentDuration);
      setEndHour(eh);
      setEndMinute(em);
    }
  }

  const handleCloseModal = () => {
    setClientId("");
    setServiceId("");
    setNotes("");
    setError("");
    onClose();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length >= 5) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setDateStr(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!barberId || !clientId || !serviceId || !dateStr) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (dateStr.length !== 10) {
      setError("Data inválida. Use o formato DD/MM/AAAA.");
      return;
    }

    if (isEndBeforeStart) {
      setError("O horário de término deve ser posterior ao de início.");
      return;
    }

    const [day, month, year] = dateStr.split("/");
    const isoDate = `${year}-${month}-${day}`;

    const parsedDate = new Date(`${isoDate}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
      setError("Data inválida. Verifique os valores inseridos.");
      return;
    }

    startTransition(async () => {
      const data = {
        barberId,
        clientId,
        barberServiceId: serviceId,
        date: isoDate,
        startHour: parseInt(startHour, 10),
        startMinute: parseInt(startMinute, 10),
        endHour: parseInt(endHour, 10),
        endMinute: parseInt(endMinute, 10),
        notes,
      };
      
      let res;
      if (appointmentToEdit) {
        // We need to import updateAppointmentAction dynamically or add it to imports
        // Actually it's better to import it at the top
        const { updateAppointmentAction } = await import("../actions");
        res = await updateAppointmentAction(appointmentToEdit.id, data);
      } else {
        res = await createAppointmentAction(data);
      }

      if (res.success) {
        setClientId("");
        setServiceId("");
        setNotes("");
        handleCloseModal();
        router.refresh();
      } else {
        setError(res.error || "Ocorreu um erro ao salvar o agendamento.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appointmentToEdit ? "Editar Agendamento" : "Novo Agendamento"}
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Row 1: Barber & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="barber">Barbeiro *</Label>
              <Select
                value={barberId}
                onValueChange={(value) => {
                  setBarberId(value || "");
                  setServiceId("");
                }}
                disabled={isPending}
              >
                <SelectTrigger id="barber" className="w-full h-10">
                  <SelectValue placeholder="Selecione...">
                    {barbers.find((b) => b.id === barberId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client">Cliente *</Label>
              <Select
                value={clientId}
                onValueChange={(value) => setClientId(value || "")}
                disabled={isPending}
              >
                <SelectTrigger id="client" className="w-full h-10">
                  <SelectValue placeholder="Selecione...">
                    {clients.find((c) => c.id === clientId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Service */}
          <div className="space-y-1.5">
            <Label htmlFor="service">Serviço *</Label>
            <SearchableSelect
              id="service"
              options={availableServices.map((bs) => ({
                id: bs.id,
                label: `${bs.service.name} (${formatCurrency(bs.price)})`,
                value: bs.service.name,
              }))}
              value={serviceId}
              onChange={handleServiceChange}
              placeholder="Selecione um serviço..."
              disabled={!barberId}
              required
            />
            {selectedService && (
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duração padrão: {selectedService.durationMinutes} min — ajuste os horários abaixo se necessário
              </p>
            )}
          </div>

          {/* Row 3: Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="text"
              placeholder="DD/MM/AAAA"
              value={dateStr}
              onChange={handleDateChange}
              className="bg-amber/5 border-amber/30 focus:bg-white focus:border-amber transition-colors"
              title="Data selecionada na agenda. Você pode alterar se necessário."
              required
            />
          </div>

          {/* Row 4: Start & End time side-by-side with duration badge */}
          <div className="space-y-1.5">
            <Label>Horário *</Label>
            <div className="flex items-center gap-3">
              {/* Start time */}
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Início</p>
                <div className="flex gap-1.5">
                  <Select
                    value={startHour}
                    onValueChange={handleStartHourChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="start-hour" className="w-full h-10">
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUR_OPTIONS.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={startMinute}
                    onValueChange={handleStartMinuteChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="start-minute" className="w-full h-10">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTE_OPTIONS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration badge */}
              <div className="flex flex-col items-center gap-0.5 shrink-0 mt-5">
                <div className="h-px w-4 bg-slate-200" />
                {durationLabel && !isEndBeforeStart ? (
                  <span className="text-[10px] font-semibold text-amber-dark bg-amber/10 border border-amber/20 rounded-md px-1.5 py-0.5 whitespace-nowrap">
                    {durationLabel}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300 whitespace-nowrap">até</span>
                )}
                <div className="h-px w-4 bg-slate-200" />
              </div>

              {/* End time */}
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Término</p>
                <div className="flex gap-1.5">
                  <Select
                    value={endHour}
                    onValueChange={(v) => { if (v) setEndHour(v); }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="end-hour"
                      className={`w-full h-10 ${isEndBeforeStart ? "border-red-300 focus:ring-red-300" : ""}`}
                    >
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUR_OPTIONS.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={endMinute}
                    onValueChange={(v) => { if (v) setEndMinute(v); }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="end-minute"
                      className={`w-full h-10 ${isEndBeforeStart ? "border-red-300 focus:ring-red-300" : ""}`}
                    >
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTE_OPTIONS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Inline validation hint */}
            {isEndBeforeStart && (
              <p className="text-[11px] text-red-500 mt-1">
                O horário de término deve ser posterior ao de início.
              </p>
            )}
          </div>

          {/* Row 5: Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências do cliente..."
              className="bg-slate-50"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <ModalFooter
          onCancel={handleCloseModal}
          isPending={isPending}
          submitLabel={appointmentToEdit ? "Salvar Alterações" : "Agendar"}
          cancelLabel="Cancelar"
          className="px-6 pb-4 bg-transparent border-t-0 mt-0"
        />
      </form>
    </Modal>
  );
}
