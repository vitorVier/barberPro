import { prisma } from "./prisma";

// ─── Helpers ────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ─── Appointments Page Queries ──────────────────────────────

export async function getActiveBarbers() {
  return prisma.barber.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getAppointmentsByDate(date: Date, barberId?: string) {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const where: Record<string, unknown> = {
    startsAt: { gte: start, lte: end },
  };

  if (barberId) {
    where.barberId = barberId;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      barber: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true, phone: true } },
      barberService: {
        include: {
          service: { select: { name: true } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getAppointmentsByDateRange(startDate: Date, endDate: Date, barberId?: string) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const where: Record<string, unknown> = {
    startsAt: { gte: start, lte: end },
  };

  if (barberId) {
    where.barberId = barberId;
  }

  return prisma.appointment.findMany({
    where,
    include: {
      barber: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true, phone: true } },
      barberService: {
        include: {
          service: { select: { name: true } },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
}

export async function getAppointmentsCountByDate(date: Date) {
  const start = startOfDay(date);
  const end = endOfDay(date);

  return prisma.appointment.count({
    where: {
      startsAt: { gte: start, lte: end },
    },
  });
}

export async function getAllClients() {
  return prisma.client.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getBarberServices(barberId: string) {
  return prisma.barberService.findMany({
    where: { barberId },
    include: {
      service: { select: { id: true, name: true } },
    },
    orderBy: { service: { name: "asc" } },
  });
}

export async function getAllBarberServices() {
  return prisma.barberService.findMany({
    include: {
      service: { select: { id: true, name: true } },
      barber: { select: { id: true, name: true } },
    },
    orderBy: { service: { name: "asc" } },
  });
}

export type AppointmentWithRelations = Awaited<
  ReturnType<typeof getAppointmentsByDate>
>[number];

