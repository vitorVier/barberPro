"use client";

import { useState } from "react";
import { ModalNewAppointment } from "./modal-new-appointment";
import { ActionButton } from "@/components/ui/action-button";

interface NewAppointmentWrapperProps {
  barbers: any[];
  clients: any[];
  barberServices: any[];
  currentDate: string;
  currentBarberId?: string;
}

export function NewAppointmentWrapper({
  barbers,
  clients,
  barberServices,
  currentDate,
  currentBarberId,
}: NewAppointmentWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ActionButton
        id="new-appointment-btn"
        onClick={() => setIsModalOpen(true)}
      >
        Novo Agendamento
      </ActionButton>

      <ModalNewAppointment
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        barbers={barbers}
        clients={clients}
        barberServices={barberServices}
        defaultDate={currentDate}
        defaultBarberId={currentBarberId}
      />
    </>
  );
}
