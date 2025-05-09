import { EntityName } from '@/shared/utils'

const APPOINTMENT_NAME = new EntityName({ gender: 'M', plural: 'turnos', singular: 'turno' })
const APPOINTMENT_MAX_STUDENTS = 20 // TODO: This must be configurable in the backend

export { APPOINTMENT_NAME, APPOINTMENT_MAX_STUDENTS }
