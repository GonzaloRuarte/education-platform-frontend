import { T_AppointmentStatus } from './types'

const appointmentStatusCodeToLabels: Record<T_AppointmentStatus, string> = {
  F: 'Libre',
  P: 'Pendiente',
  A: 'Aprobado',
  R: 'Rechazado',
}

export { appointmentStatusCodeToLabels }
