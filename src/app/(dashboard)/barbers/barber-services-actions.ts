"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

// 1. Fetch allocated services
export async function getBarberServicesAction(barberId: string) {
  try {
    const barberServices = await prisma.barberService.findMany({
      where: { barberId },
      include: {
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Serialize Decimal and Date objects for the Client Component
    const serializedData = barberServices.map((item) => ({
      ...item,
      price: Number(item.price),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      service: {
        ...item.service,
        price: Number(item.service.price),
        createdAt: item.service.createdAt.toISOString(),
        updatedAt: item.service.updatedAt.toISOString(),
      }
    }));
    
    return { success: true, data: serializedData };
  } catch (error) {
    console.error("Error fetching barber services:", error);
    return { success: false, error: "Erro ao buscar serviços do barbeiro." };
  }
}

// 2. Fetch available services (not yet allocated)
export async function getAvailableServicesAction(barberId: string) {
  try {
    // Get IDs of services already allocated
    const allocatedServices = await prisma.barberService.findMany({
      where: { barberId },
      select: { serviceId: true },
    });

    const allocatedIds = allocatedServices.map((bs) => bs.serviceId);

    // Get all active services that are not in the allocated list
    const availableServices = await prisma.service.findMany({
      where: {
        isActive: true,
        id: {
          notIn: allocatedIds,
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Serialize Decimal and Date objects for the Client Component
    const serializedData = availableServices.map((item) => ({
      ...item,
      price: Number(item.price),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return { success: true, data: serializedData };
  } catch (error) {
    console.error("Error fetching available services:", error);
    return { success: false, error: "Erro ao buscar serviços disponíveis." };
  }
}

// 3. Allocate a service to a barber
interface AllocateServiceInput {
  barberId: string;
  serviceId: string;
  price: number;
  durationMinutes: number;
}

export async function allocateServiceAction(data: AllocateServiceInput): Promise<ActionResponse> {
  try {
    if (!data.barberId || !data.serviceId) {
      return { success: false, error: "Barbeiro e Serviço são obrigatórios." };
    }
    if (data.price < 0 || data.durationMinutes <= 0) {
      return { success: false, error: "Preço e duração devem ser valores válidos." };
    }

    await prisma.barberService.create({
      data: {
        barberId: data.barberId,
        serviceId: data.serviceId,
        price: data.price,
        durationMinutes: data.durationMinutes,
      },
    });

    revalidatePath("/barbers");
    return { success: true };
  } catch (error: any) {
    console.error("Error allocating service:", error);
    
    if (error.code === 'P2002') {
      return { success: false, error: "Este serviço já está alocado para este barbeiro." };
    }
    
    return { success: false, error: "Erro interno ao alocar serviço." };
  }
}

// 4. Update an allocated service
interface UpdateAllocatedServiceInput {
  id: string; // BarberService ID
  price: number;
  durationMinutes: number;
}

export async function updateAllocatedServiceAction(data: UpdateAllocatedServiceInput): Promise<ActionResponse> {
  try {
    if (!data.id) {
      return { success: false, error: "ID da alocação não fornecido." };
    }
    if (data.price < 0 || data.durationMinutes <= 0) {
      return { success: false, error: "Preço e duração devem ser valores válidos." };
    }

    await prisma.barberService.update({
      where: { id: data.id },
      data: {
        price: data.price,
        durationMinutes: data.durationMinutes,
      },
    });

    revalidatePath("/barbers");
    return { success: true };
  } catch (error) {
    console.error("Error updating allocated service:", error);
    return { success: false, error: "Erro interno ao atualizar serviço alocado." };
  }
}

// 5. Remove an allocated service
export async function removeAllocatedServiceAction(id: string): Promise<ActionResponse> {
  try {
    if (!id) {
      return { success: false, error: "ID da alocação não fornecido." };
    }

    await prisma.barberService.delete({
      where: { id },
    });

    revalidatePath("/barbers");
    return { success: true };
  } catch (error) {
    console.error("Error removing allocated service:", error);
    return { success: false, error: "Erro interno ao remover serviço alocado." };
  }
}
