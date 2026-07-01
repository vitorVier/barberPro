"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/utils/types";

interface CreateBarberInput {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface UpdateBarberInput extends CreateBarberInput {
  id: string;
}

interface SetBarberStatusInput {
  barberId: string;
  isActive: boolean;
}

export async function createBarberAction(data: CreateBarberInput): Promise<ActionResponse> {
  try {
    // Basic validation
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "O nome é obrigatório." };
    }
    if (!data.email || !data.email.trim()) {
      return { success: false, error: "O e-mail é obrigatório." };
    }

    // Check if email already exists
    const existingBarber = await prisma.barber.findUnique({
      where: { email: data.email.trim() },
    });

    if (existingBarber) {
      return { success: false, error: "Este e-mail já está sendo usado por outro barbeiro." };
    }

    // Create the barber
    await prisma.barber.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        isActive: data.isActive,
      },
    });

    // Revalidate the dashboard and barbers page list
    revalidatePath("/barbers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating barber:", error);
    return { success: false, error: "Erro interno ao cadastrar o barbeiro. Tente novamente." };
  }
}

export async function deleteBarberAction(barberId: string) {
  if(!barberId) return { success: false, error: "O id do barbeiro é obrigatório." }

  const existingBarber = await prisma.barber.findUnique({
    where: { id: barberId }
  });

  if(!existingBarber) return { success: false, error: "Barber not found." }

  await prisma.barber.delete({
    where: { id: barberId }
  });
}

export async function updateBarberAction(data: UpdateBarberInput): Promise<ActionResponse> {
  await prisma.barber.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
      avatarUrl: data.avatarUrl?.trim() || null,
      isActive: data.isActive,
    },
  });

  return { success: true }
}

export async function setBarberStatusAction(data: SetBarberStatusInput): Promise<ActionResponse> {
  try {
    const barber = await prisma.barber.findUnique({
      where: {
        id: data.barberId,
      },
    });

    if (!barber) {
      return {
        success: false,
        error: "Barbeiro não encontrado.",
      };
    }

    await prisma.barber.update({
      where: {
        id: data.barberId,
      },
      data: {
        isActive: data.isActive,
      },
    });

    revalidatePath("/barbers");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Erro ao alterar status do barbeiro.",
    };
  }
}
