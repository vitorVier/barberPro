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

// Pre-compute the days-of-week labels once
const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

// ─── Dashboard Queries ─────────────────────────────────────

/** Single query: returns { active, total } counts for barbers */
export async function getBarberStats() {
  const barbers = await prisma.barber.findMany({
    select: { isActive: true },
  });
  return {
    active: barbers.filter((b) => b.isActive).length,
    total: barbers.length,
  };
}

export async function getClientsCount() {
  return prisma.client.count();
}

export async function getTodayStats() {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: start, lte: end },
    },
    include: {
      barber: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      barberService: {
        include: {
          service: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  const serializedAppointments = appointments.map((appointment) => ({
    ...appointment,
    barberService: {
      ...appointment.barberService,
      price: Number(appointment.barberService.price),
    },
  }));

  let completed = 0;
  let estimatedRevenue = 0;

  for (const a of serializedAppointments) {
    if (a.status === "COMPLETED") completed++;

    if (
      a.status !== "CANCELLED" &&
      a.status !== "NO_SHOW"
    ) {
      estimatedRevenue += a.barberService.price;
    }
  }

  return {
    appointments: serializedAppointments,
    total: serializedAppointments.length,
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

  // Pre-compute day boundaries once
  const days: { label: string; start: number; end: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    days.push({
      label: DAYS_OF_WEEK[date.getDay()],
      start: startOfDay(date).getTime(),
      end: endOfDay(date).getTime(),
    });
  }

  // Single pass through appointments to bucket them
  const counts = new Array<number>(7).fill(0);
  for (const a of appointments) {
    const t = new Date(a.startsAt).getTime();
    for (let j = 0; j < days.length; j++) {
      if (t >= days[j].start && t <= days[j].end) {
        counts[j]++;
        break; // each appointment belongs to exactly one day
      }
    }
  }

  return days.map((d, i) => ({ day: d.label, count: counts[i] }));
}

export async function getRecentAppointments(limit = 10) {
  return prisma.appointment.findMany({
    include: {
      barber: {
        select: {
          name: true,
        },
      },

      client: {
        select: {
          name: true,
        },
      },

      barberService: {
        include: {
          service: {
            select: {
              name: true,
            },
          },
        },
      },
    },

    // Últimos agendamentos criados
    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });
}
