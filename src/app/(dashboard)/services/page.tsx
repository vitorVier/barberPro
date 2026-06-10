import { Header } from "@/app/(dashboard)/components/topbar";
import { Scissors } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ServicesClient, ServiceWithCounts } from "./components/services-client";

async function getServices(): Promise<ServiceWithCounts[]> {
  const services = await prisma.service.findMany({
    include: {
      _count: {
        select: {
          barberServices: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Serialize Prisma.Decimal to number
  return services.map((service) => ({
    ...service,
    price: service.price.toNumber(),
  }));
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Top Bar */}
      <Header icon={Scissors} span="Serviços" />

      {/* Main Content Area */}
      <ServicesClient initialServices={services} />
    </div>
  );
}