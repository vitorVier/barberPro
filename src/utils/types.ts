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
  barberId?: string;
  clientId?: string;
  barberServiceId?: string;
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

export interface Barber {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ClientBasic {
  id: string;
  name: string;
  phone?: string | null;
}

export interface BarberServiceBasic {
  id: string;
  price: number;
  durationMinutes: number;
  barberId: string;
  service: {
    id: string;
    name: string;
  };
}

export type ActionResponse = {
  success: boolean;
  error?: string;
};