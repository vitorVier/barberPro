import { BeardIcon, EyebrowIcon, HaircutBeardIcon, HairIcon, hairTreatmentIcon } from "@/components/icons";
import {
  TbVip,
  TbPalette,
  TbDots
} from "react-icons/tb";
import type { ServiceCategory } from "@/generated/prisma/enums";

export type { ServiceCategory };

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  HAIRCUT: "Corte",
  BEARD: "Barba",
  EYEBROW: "Sobrancelha",
  HAIRCUT_BEARD: "Cabelo e Barba",
  FULL_SERVICE: "Serviço Completo",
  HAIR_TREATMENT: "Tratamento Capilar",
  COLORING: "Coloração",
  OTHER: "Outros",
};

export const SERVICE_ICONS = {
  HAIRCUT: HairIcon,
  BEARD: BeardIcon,
  EYEBROW: EyebrowIcon,
  HAIRCUT_BEARD: HaircutBeardIcon,
  FULL_SERVICE: TbVip,
  HAIR_TREATMENT: hairTreatmentIcon,
  COLORING: TbPalette,
  OTHER: TbDots,
} as const;

export function getServiceIcon(category: string) {
  return SERVICE_ICONS[
    category as keyof typeof SERVICE_ICONS
  ] ?? SERVICE_ICONS.OTHER;
}