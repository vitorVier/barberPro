import { 
  TbScissors, 
  TbMoustache, 
  TbEye, 
  TbRazor, 
  TbVip, 
  TbBottle, 
  TbPalette, 
  TbDots 
} from "react-icons/tb";

export const SERVICE_ICONS = {
  HAIRCUT: TbScissors,
  BEARD: TbMoustache,
  EYEBROW: TbEye,
  HAIRCUT_BEARD: TbRazor,
  FULL_SERVICE: TbVip,
  HAIR_TREATMENT: TbBottle,
  COLORING: TbPalette,
  OTHER: TbDots,
} as const;

export function getServiceIcon(category: string) {
  return SERVICE_ICONS[
    category as keyof typeof SERVICE_ICONS
  ] ?? SERVICE_ICONS.OTHER;
}