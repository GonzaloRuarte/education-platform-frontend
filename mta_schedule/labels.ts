import { T_AppointmentOccurrenceStatus, T_AppointmentStatus } from './types'

const appointmentStatusCodeToLabels: Record<T_AppointmentStatus, string> = {
  F: 'Libre',
  P: 'Pendiente',
  A: 'Aprobado',
  R: 'Rechazado',
}
const appointmentOccurrenceStatusCodeToLabels: Record<T_AppointmentOccurrenceStatus, string> = {
  PAST: 'Pasado',
  ONGOING: 'En curso',
  UPCOMING: 'Próximo',
}

const appointmentLabels = {
  begins_at: 'Desde',
  quantity: 'Cantidad de turnos en ese horario',
}

export { appointmentStatusCodeToLabels, appointmentLabels, appointmentOccurrenceStatusCodeToLabels }
