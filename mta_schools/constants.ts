import { EntityName } from '@/shared/utils'

const STUDENT_PROFILE_NAME = new EntityName({ gender: 'X', plural: 'estudiantes', singular: 'estudiante' })
const SCHOOL_NAME = new EntityName({ gender: 'F', plural: 'escuelas', singular: 'escuela' })

export { STUDENT_PROFILE_NAME, SCHOOL_NAME }
