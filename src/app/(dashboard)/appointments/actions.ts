"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/utils/types";

interface CreateAppointmentInput {
  barberId: string;
  clientId: string;
  barberServiceId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
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

    const startTotalMins = data.startHour * 60 + data.startMinute;
    const endTotalMins = data.endHour * 60 + data.endMinute;
    if (endTotalMins <= startTotalMins) {
      return {
        success: false,
        error: "O horário de término deve ser posterior ao de início.",
      };
    }

    // ── Resolve BarberService (for conflict check) ────────────
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

    // ── Build startsAt / endsAt from explicit times ──────────
    const startsAt = new Date(`${data.date}T00:00:00`);
    startsAt.setHours(data.startHour, data.startMinute, 0, 0);

    const endsAt = new Date(`${data.date}T00:00:00`);
    endsAt.setHours(data.endHour, data.endMinute, 0, 0);

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

export async function updateAppointmentAction(
  appointmentId: string,
  data: CreateAppointmentInput
): Promise<ActionResponse> {
  try {
    if (!appointmentId?.trim()) {
      return { success: false, error: "ID do agendamento inválido." };
    }
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

    const startTotalMins = data.startHour * 60 + data.startMinute;
    const endTotalMins = data.endHour * 60 + data.endMinute;
    if (endTotalMins <= startTotalMins) {
      return {
        success: false,
        error: "O horário de término deve ser posterior ao de início.",
      };
    }

    const barberService = await prisma.barberService.findUnique({
      where: { id: data.barberServiceId },
    });

    if (!barberService) {
      return { success: false, error: "Serviço não encontrado." };
    }

    if (barberService.barberId !== data.barberId) {
      return {
        success: false,
        error: "Este serviço não pertence ao barbeiro selecionado.",
      };
    }

    const startsAt = new Date(`${data.date}T00:00:00`);
    startsAt.setHours(data.startHour, data.startMinute, 0, 0);

    const endsAt = new Date(`${data.date}T00:00:00`);
    endsAt.setHours(data.endHour, data.endMinute, 0, 0);

    const conflicting = await prisma.appointment.findFirst({
      where: {
        id: { not: appointmentId },
        barberId: data.barberId,
        status: { notIn: ["CANCELLED"] },
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

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        barberId: data.barberId,
        clientId: data.clientId,
        barberServiceId: data.barberServiceId,
        startsAt,
        endsAt,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/appointments");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating appointment:", error);
    return {
      success: false,
      error: "Erro interno ao atualizar o agendamento. Tente novamente.",
    };
  }
}

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResponse> {
  try {
    if (!appointmentId?.trim()) {
      return { success: false, error: "ID do agendamento inválido." };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    revalidatePath("/appointments");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating appointment status:", error);
    return {
      success: false,
      error: "Erro interno ao atualizar o status. Tente novamente.",
    };
  }
}

export async function deleteAppointmentAction(
  appointmentId: string
): Promise<ActionResponse> {
  try {
    if (!appointmentId?.trim()) {
      return { success: false, error: "ID do agendamento inválido." };
    }

    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    revalidatePath("/appointments");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting appointment:", error);
    return {
      success: false,
      error: "Erro interno ao remover o agendamento. Tente novamente.",
    };
  }
}

export async function getAppointmentFormDataAction() {
  try {
    const { getActiveBarbers, getAllClients, getAllBarberServices } = await import("@/lib/appointments");
    const [barbers, clients, allServices] = await Promise.all([
      getActiveBarbers(),
      getAllClients(),
      getAllBarberServices(),
    ]);

    // Serialize services to avoid Date objects in Client Components
    const serializedServices = allServices.map((s) => ({
      ...s,
      price: Number(s.price),
      createdAt: s.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: {
        barbers,
        clients,
        barberServices: serializedServices,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching form data:", error);
    return {
      success: false,
      error: "Erro ao carregar os dados para edição.",
    };
  }
}

export type RecentPeriod =
  | "this_week"
  | "last_week"
  | "last_7_days"
  | "last_3_days"
  | "today"
  | "yesterday";

function getDateRangeForPeriod(period: RecentPeriod): { start: Date; end: Date } {
  const now = new Date();

  function startOfDay(d: Date) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  }
  function endOfDay(d: Date) {
    const c = new Date(d);
    c.setHours(23, 59, 59, 999);
    return c;
  }

  switch (period) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };

    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }

    case "last_3_days": {
      const d = new Date(now);
      d.setDate(now.getDate() - 2);
      return { start: startOfDay(d), end: endOfDay(now) };
    }

    case "last_7_days": {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      return { start: startOfDay(d), end: endOfDay(now) };
    }

    case "this_week": {
      const day = now.getDay(); // 0 = Sunday
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: startOfDay(monday), end: endOfDay(sunday) };
    }

    case "last_week": {
      const day = now.getDay();
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - ((day + 6) % 7));
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      return { start: startOfDay(lastMonday), end: endOfDay(lastSunday) };
    }
  }
}

export async function getRecentAppointmentsByPeriodAction(period: RecentPeriod) {
  try {
    const { start, end } = getDateRangeForPeriod(period);

    const appointments = await prisma.appointment.findMany({
      where: {
        startsAt: { gte: start, lte: end },
      },
      include: {
        barber: { select: { name: true } },
        client: { select: { name: true } },
        barberService: {
          include: {
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { startsAt: "desc" },
    });

    const serialized = appointments.map((a) => ({
      ...a,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      barberService: {
        ...a.barberService,
        price: Number(a.barberService.price),
        createdAt: a.barberService.createdAt.toISOString(),
        service: a.barberService.service,
      },
    }));

    return { success: true, data: serialized };
  } catch (error: unknown) {
    console.error("Error fetching appointments by period:", error);
    return { success: false, error: "Erro ao carregar os agendamentos." };
  }
}
