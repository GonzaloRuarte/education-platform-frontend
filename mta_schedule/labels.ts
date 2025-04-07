import { T_AppointmentStatus } from './types'

const appointmentStatusCodeToLabels: Record<T_AppointmentStatus, string> = {
  F: 'Libre',
  P: 'Pendiente',
  A: 'Aprobado',
  R: 'Rechazado',
}

const appointmentLabels = {
  begins_at: 'Desde',
  quantity: 'Cantidad de turnos en ese horario',
}

export { appointmentStatusCodeToLabels, appointmentLabels }
