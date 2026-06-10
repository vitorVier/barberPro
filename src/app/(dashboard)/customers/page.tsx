import { Header } from "@/app/(dashboard)/components/topbar";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./components/customers-client";

async function getCustomers() {
  const customers = await prisma.client.findMany({
    include: {
      _count: {
        select: {
          appointments: true,
        },
      },
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 1,
        select: {
          startsAt: true,
          barberService: {
            select: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Transform the data to include lastAppointment directly
  return customers.map(({ appointments, ...rest }) => ({
    ...rest,
    lastAppointment: appointments[0] || null,
  }));
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top Bar */}
      <Header icon={Users} span="Clientes" />

      {/* Main Content Area */}
      <CustomersClient initialCustomers={customers} />
    </div>
  );
}