"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

interface CreateAppointmentInput {
  barberId: string;
  clientId: string;
  barberServiceId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startHour: number;
  startMinute: number;
  notes?: string;
}

export async function createAppointmentAction(
  data: CreateAppointmentInput
): Promise<ActionResponse> {
  try {
    // ── Validation ──────────────────────────────────────────
    if (!data.barberId?.trim()) {
      return { success: false, error: "Selecione um barbeiro." };
    }
    if (!data.clientId?.trim()) {
      return { success: false, error: "Selecione um cliente." };
    }
    if (!data.barberServiceId?.trim()) {
      return { success: false, error: "Selecione um serviço." };
    }
    if (!data.date) {
      return { success: false, error: "Informe a data do agendamento." };
    }

    // ── Resolve BarberService for duration ───────────────────
    const barberService = await prisma.barberService.findUnique({
      where: { id: data.barberServiceId },
    });

    if (!barberService) {
      return { success: false, error: "Serviço não encontrado." };
    }

    // Verify the barberService belongs to the selected barber
    if (barberService.barberId !== data.barberId) {
      return {
        success: false,
        error: "Este serviço não pertence ao barbeiro selecionado.",
      };
    }

    // ── Build startsAt / endsAt ─────────────────────────────
    const startsAt = new Date(`${data.date}T00:00:00`);
    startsAt.setHours(data.startHour, data.startMinute, 0, 0);

    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + barberService.durationMinutes);

    // Sanity: ensure date is not in the distant past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(`${data.date}T00:00:00`);
    if (appointmentDate < now) {
      return {
        success: false,
        error: "Não é possível agendar em uma data passada.",
      };
    }

    // ── Check for time conflicts ────────────────────────────
    const conflicting = await prisma.appointment.findFirst({
      where: {
        barberId: data.barberId,
        status: { notIn: ["CANCELLED"] },
        // Overlapping: existingStart < newEnd AND existingEnd > newStart
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (conflicting) {
      return {
        success: false,
        error: "Já existe um agendamento nesse horário para este barbeiro.",
      };
    }

    // ── Create appointment ──────────────────────────────────
    await prisma.appointment.create({
      data: {
        barberId: data.barberId,
        clientId: data.clientId,
        barberServiceId: data.barberServiceId,
        startsAt,
        endsAt,
        notes: data.notes?.trim() || null,
        // status defaults to SCHEDULED via Prisma schema
      },
    });

    // Revalidate pages
    revalidatePath("/appointments");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      error: "Erro interno ao criar o agendamento. Tente novamente.",
    };
  }
}
