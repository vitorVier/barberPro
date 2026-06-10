"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

interface CreateServiceInput {
  name: string;
  description?: string;
  durationMinutes?: string;
  price: number;
  isActive: boolean;
}

export interface UpdateServiceInput extends CreateServiceInput {
  id: string;
}

export async function createServiceAction(data: CreateServiceInput): Promise<ActionResponse> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "O nome é obrigatório." };
    }
    if (data.price === undefined || data.price < 0) {
      return { success: false, error: "O preço deve ser um valor válido." };
    }

    await prisma.service.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        durationMinutes: data.durationMinutes?.trim() || null,
        price: data.price,
        isActive: data.isActive,
      },
    });

    revalidatePath("/services");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, error: "Erro interno ao cadastrar o serviço. Tente novamente." };
  }
}

export async function updateServiceAction(data: UpdateServiceInput): Promise<ActionResponse> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "O nome é obrigatório." };
    }
    if (data.price === undefined || data.price < 0) {
      return { success: false, error: "O preço deve ser um valor válido." };
    }

    await prisma.service.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        durationMinutes: data.durationMinutes?.trim() || null,
        price: data.price,
        isActive: data.isActive,
      },
    });

    revalidatePath("/services");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return { success: false, error: "Erro interno ao atualizar o serviço. Tente novamente." };
  }
}

export async function deleteServiceAction(serviceId: string): Promise<ActionResponse> {
  try {
    if (!serviceId) {
      return { success: false, error: "O id do serviço é obrigatório." };
    }

    const existing = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existing) {
      return { success: false, error: "Serviço não encontrado." };
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    revalidatePath("/services");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting service:", error);

    // Handle foreign key constraint
    if (error?.code === "P2003") {
      return {
        success: false,
        error: "Não é possível excluir o serviço pois ele possui barbeiros vinculados.",
      };
    }

    return { success: false, error: "Erro interno ao excluir o serviço. Tente novamente." };
  }
}

export async function setServiceStatusAction(serviceId: string, isActive: boolean): Promise<ActionResponse> {
  try {
    if (!serviceId) {
      return { success: false, error: "O id do serviço é obrigatório." };
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive },
    });

    revalidatePath("/services");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating service status:", error);
    return { success: false, error: "Erro ao alterar status do serviço. Tente novamente." };
  }
}
