import { EntityName } from '@/shared/utils'

const APPOINTMENT_NAME = new EntityName({ gender: 'M', plural: 'turnos', singular: 'turno' })
const APPOINTMENT_MAX_STUDENTS = 60 
const MAX_APPOINTMENTS_PER_SHIFT = 400

export { APPOINTMENT_NAME, APPOINTMENT_MAX_STUDENTS, MAX_APPOINTMENTS_PER_SHIFT }
