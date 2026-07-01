"use client";

import { useState, useTransition, useEffect } from "react";
import { ModalAppointmentDetail } from "./modal-appointment-detail";
import { ModalNewAppointment } from "./modal-new-appointment";
import { getAppointmentFormDataAction } from "../actions";

interface Appointment {
  id: string;
  startsAt: string | Date;
  endsAt: string | Date;
  status: string;
  notes: string | null;
  barber: { id: string; name: string; avatarUrl: string | null };
  client: { id: string; name: string; phone: string | null };
  barberService: {
    price: unknown;
    durationMinutes: number;
    service: { name: string };
  };
}

interface AppointmentModalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function AppointmentModalManager({
  isOpen,
  onClose,
  appointment,
}: AppointmentModalManagerProps) {
  const [mode, setMode] = useState<"detail" | "edit">("detail");
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<{
    barbers: any[];
    clients: any[];
    barberServices: any[];
  } | null>(null);

  // Reset to detail mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMode("detail");
    }
  }, [isOpen]);

  const handleEditClick = () => {
    // If we already have the data, just switch mode
    if (formData) {
      setMode("edit");
      return;
    }

    // Otherwise, fetch it first
    startTransition(async () => {
      const res = await getAppointmentFormDataAction();
      if (res.success && res.data) {
        setFormData(res.data);
        setMode("edit");
      } else {
        alert(res.error || "Erro ao carregar dados para edição.");
      }
    });
  };

  const handleClose = () => {
    setMode("detail");
    onClose();
  };

  if (!isOpen || !appointment) return null;

  return (
    <>
      {/* View Detail Modal */}
      <ModalAppointmentDetail
        isOpen={mode === "detail"}
        onClose={handleClose}
        appointment={appointment as any}
        onEdit={handleEditClick}
        isFetchingEdit={isPending}
      />

      {/* Edit Modal */}
      {mode === "edit" && formData && (
        <ModalNewAppointment
          isOpen={true}
          onClose={handleClose}
          barbers={formData.barbers}
          clients={formData.clients}
          barberServices={formData.barberServices}
          appointmentToEdit={appointment}
        />
      )}
    </>
  );
}
