import { EntityName } from '@/shared/utils'

const STUDENT_PROFILE_NAME = new EntityName({ gender: 'X', plural: 'estudiantes', singular: 'estudiante' })
const SCHOOL_NAME = new EntityName({ gender: 'F', plural: 'escuelas', singular: 'escuela' })

enum SchoolGrade {
  G_3 = '3',
  G_6 = '6',
  G_9 = '9',
  G_12 = '12',
}
export { STUDENT_PROFILE_NAME, SCHOOL_NAME, SchoolGrade }
