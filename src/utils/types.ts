export interface IconProps {
  className?: string;
  size?: number;
}

export interface Appointment {
  id: string;
  startsAt: string | Date;
  endsAt: string | Date;
  status: string;
  notes?: string | null;
  client: { 
    id?: string;
    name: string; 
    phone?: string | null;
  };
  barber: { 
    id?: string;
    name: string; 
    avatarUrl?: string | null;
  };
  barberService: {
    price?: number | any;
    durationMinutes?: number;
    service: { name: string };
  };
}