"use client";

import { useState, useTransition, useEffect } from "react";
import { ModalAppointmentDetail } from "./modal-appointment-detail";
import { ModalNewAppointment } from "./modal-new-appointment";
import { getAppointmentFormDataAction } from "../actions";

import { Appointment } from "@/utils/types";

interface AppointmentModalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export function AppointmentModalManager({
  isOpen,
  onClose,
  appointment,
  onStatusChange,
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
        onStatusChange={onStatusChange}
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
