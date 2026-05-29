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

function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// ─── Dashboard Queries ─────────────────────────────────────

export async function getBarberStats() {
  const [active, total] = await Promise.all([
    prisma.barber.count({ where: { isActive: true } }),
    prisma.barber.count(),
  ]);
  return { active, total };
}

export async function getClientsCount() {
  return prisma.client.count();
}

export async function getTodayAppointments() {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  return prisma.appointment.findMany({
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
    orderBy: { startsAt: "asc" },
  });
}

export async function getTodayStats() {
  const appointments = await getTodayAppointments();

  const completed = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  const estimatedRevenue = appointments
    .filter((a) => a.status !== "CANCELLED" && a.status !== "NO_SHOW")
    .reduce((sum, a) => sum + Number(a.barberService.price), 0);

  return {
    appointments,
    total: appointments.length,
    completed,
    estimatedRevenue,
  };
}

export async function getLast7DaysAppointments() {
  const now = new Date();
  const sevenDaysAgo = startOfDay(subDays(now, 6));
  const end = endOfDay(now);

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: sevenDaysAgo, lte: end },
    },
    select: { startsAt: true },
  });

  // Group by day of week
  const daysOfWeek = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  // Build array for last 7 days in order
  const result: { day: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const count = appointments.filter((a) => {
      const t = new Date(a.startsAt).getTime();
      return t >= dayStart.getTime() && t <= dayEnd.getTime();
    }).length;

    result.push({
      day: daysOfWeek[date.getDay()],
      count,
    });
  }

  return result;
}

export async function getRecentAppointments(limit = 5) {
  return prisma.appointment.findMany({
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
    take: limit,
  });
}
