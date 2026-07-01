import Image from "next/image";
import haircutBeard from '@/assets/haircut-beard.png'
import beard from '@/assets/beard.png'
import hair from '@/assets/hair.png'
import eyeBrow from '@/assets/eyebrow.png'
import hairTreatment from '@/assets/hairTreatment.png'

interface ServiceImageIconProps {
  className?: string;
}

export function HairIcon({}: ServiceImageIconProps) {
  return (
    <Image
      src={hair}
      alt="Barba"
      width={35}
      height={35}
    />
  );
}

export function BeardIcon({}: ServiceImageIconProps) {
  return (
    <Image
      src={beard}
      alt="Barba"
      width={38}
      height={38}
    />
  );
}

export function HaircutBeardIcon({}: ServiceImageIconProps) {
  return (
    <Image
      src={haircutBeard}
      alt="Cabelo e Barba"
      width={24}
      height={24}
    />
  );
}

export function EyebrowIcon({}: ServiceImageIconProps) {
  return (
    <Image
      src={eyeBrow}
      alt="Barba"
      width={35}
      height={40}
    />
  );
}

export function hairTreatmentIcon({}: ServiceImageIconProps) {
  return (
    <Image
      src={hairTreatment}
      alt="Barba"
      width={16}
      height={16}
    />
  );
}