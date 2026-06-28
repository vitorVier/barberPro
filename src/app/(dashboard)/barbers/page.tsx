import { Header } from "@/app/(dashboard)/components/topbar";
import { Contact } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BarbersClient } from "./components/barbers-client";

async function getBarbers() {
  return prisma.barber.findMany({
    include: {
      _count: {
        select: {
          barberService: true,
          appointments: {
            where: {
              status: { notIn: ['COMPLETED', 'NO_SHOW', 'CANCELLED']},
            }
          }
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function BarbersPage() {
  const barbers = await getBarbers();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top Bar */}
      <Header icon={Contact} span="BARBEIROS" />

      {/* Main Content Area */}
      <BarbersClient initialBarbers={barbers} />
    </div>
  );
}