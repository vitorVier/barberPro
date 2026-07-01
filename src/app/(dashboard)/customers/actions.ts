"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/utils/types";

interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateCustomerInput extends CreateCustomerInput {
  id: string;
}

export async function createCustomerAction(data: CreateCustomerInput): Promise<ActionResponse> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "O nome é obrigatório." };
    }

    // Check for duplicate email if provided
    if (data.email && data.email.trim()) {
      const existing = await prisma.client.findUnique({
        where: { email: data.email.trim().toLowerCase() },
      });

      if (existing) {
        return { success: false, error: "Este e-mail já está sendo usado por outro cliente." };
      }
    }

    await prisma.client.create({
      data: {
        name: data.name.trim(),
        email: data.email?.trim().toLowerCase() || null,
        phone: data.phone?.trim() || null,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Erro interno ao cadastrar o cliente. Tente novamente." };
  }
}

export async function updateCustomerAction(data: UpdateCustomerInput): Promise<ActionResponse> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "O nome é obrigatório." };
    }

    // Check for duplicate email if provided (excluding current customer)
    if (data.email && data.email.trim()) {
      const existing = await prisma.client.findUnique({
        where: { email: data.email.trim().toLowerCase() },
      });

      if (existing && existing.id !== data.id) {
        return { success: false, error: "Este e-mail já está sendo usado por outro cliente." };
      }
    }

    await prisma.client.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        email: data.email?.trim().toLowerCase() || null,
        phone: data.phone?.trim() || null,
      },
    });

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: "Erro interno ao atualizar o cliente. Tente novamente." };
  }
}

export async function deleteCustomerAction(customerId: string): Promise<ActionResponse> {
  try {
    if (!customerId) {
      return { success: false, error: "O id do cliente é obrigatório." };
    }

    const existing = await prisma.client.findUnique({
      where: { id: customerId },
    });

    if (!existing) {
      return { success: false, error: "Cliente não encontrado." };
    }

    // Check if customer has appointments
    const appointmentCount = await prisma.appointment.count({
      where: { clientId: customerId },
    });

    if (appointmentCount > 0) {
      // We still allow deletion but warn in the future
      // For now, just delete
    }

    await prisma.client.delete({
      where: { id: customerId },
    });

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting customer:", error);

    // Handle foreign key constraint
    if (error?.code === "P2003") {
      return {
        success: false,
        error: "Não é possível excluir o cliente pois ele possui agendamentos vinculados.",
      };
    }

    return { success: false, error: "Erro interno ao excluir o cliente. Tente novamente." };
  }
}
