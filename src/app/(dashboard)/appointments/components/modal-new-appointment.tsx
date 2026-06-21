"use client";

import { useState, useTransition, useEffect } from "react";
import { ModalBarber } from "@/app/(dashboard)/components/modal-barber";
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
interface ModalNewAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: any[];
  clients: any[];
  barberServices: any[];
  defaultDate?: string;
  defaultBarberId?: string;
}

export function ModalNewAppointment({
  isOpen,
  onClose,
  barbers,
  clients,
  barberServices,
  defaultDate,
  defaultBarberId,
}: ModalNewAppointmentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [barberId, setBarberId] = useState(defaultBarberId || "");
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");

  // Store the initial date from the agenda context
  const [dateStr, setDateStr] = useState("");

  // Format incoming YYYY-MM-DD to DD/MM/YYYY and sync when modal opens
  useEffect(() => {
    if (isOpen) {
      if (defaultDate) {
        const parts = defaultDate.split("-");
        if (parts.length === 3) {
          setDateStr(`${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      } else {
        // Fallback to today if no date provided
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        setDateStr(`${day}/${month}/${year}`);
      }
    }
  }, [isOpen, defaultDate]);

  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");

  const availableServices = barberServices.filter(
    (bs) => bs.barberId === barberId
  );

  const handleCloseModal = () => {
    // Reset form fields when closing without saving
    // This ensures the agenda date context is preserved
    setClientId("");
    setServiceId("");
    setNotes("");
    setError("");
    // Note: barberId is kept if pre-selected from current barber filter
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

    if (!barberId || !clientId || !serviceId || !dateStr || !hour || !minute) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (dateStr.length !== 10) {
      setError("Data inválida. Use o formato DD/MM/AAAA.");
      return;
    }

    const [day, month, year] = dateStr.split("/");
    const isoDate = `${year}-${month}-${day}`;

    // Basic date validation
    const parsedDate = new Date(`${isoDate}T00:00:00`);
    if (isNaN(parsedDate.getTime())) {
      setError("Data inválida. Verifique os valores inseridos.");
      return;
    }

    startTransition(async () => {
      const res = await createAppointmentAction({
        barberId,
        clientId,
        barberServiceId: serviceId,
        date: isoDate,
        startHour: parseInt(hour, 10),
        startMinute: parseInt(minute, 10),
        notes,
      });

      if (res.success) {
        setClientId("");
        setServiceId("");
        setNotes("");
        handleCloseModal();
      } else {
        setError(res.error || "Ocorreu um erro ao criar o agendamento.");
      }
    });
  };


  return (
    <ModalBarber
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Agendamento"
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
                label: `${bs.service.name} (R$ ${Number(bs.price).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })})`,
                value: bs.service.name,
              }))}
              value={serviceId}
              onChange={setServiceId}
              placeholder="Selecione um serviço..."
              disabled={!barberId}
              required
            />
          </div>

          {/* Row 3: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

            <div className="space-y-1.5">
              <Label>Horário de Início *</Label>
              <div className="flex gap-2">
                <Select value={hour} onValueChange={(v) => setHour(v || "")} disabled={isPending}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 13 }).map((_, i) => {
                      const h = (i + 8).toString().padStart(2, "0");
                      return (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select value={minute} onValueChange={(v) => setMinute(v || "")} disabled={isPending}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Minuto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00">00</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 4: Notes */}
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
          submitLabel="Agendar"
          cancelLabel="Cancelar"
          className="px-6 pb-4 bg-transparent border-t-0 mt-0"
        />
      </form>
    </ModalBarber>
  );
}
