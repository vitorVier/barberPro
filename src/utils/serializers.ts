export function serializeAppointment(appointment: any) {
  return {
    ...appointment,
    startsAt: appointment.startsAt?.toISOString(),
    endsAt: appointment.endsAt?.toISOString(),
    createdAt: appointment.createdAt?.toISOString(),
    updatedAt: appointment.updatedAt?.toISOString(),
    barberService: appointment.barberService ? {
      ...appointment.barberService,
      price: Number(appointment.barberService.price),
      createdAt: appointment.barberService.createdAt?.toISOString(),
      service: appointment.barberService.service,
    } : undefined,
  };
}
