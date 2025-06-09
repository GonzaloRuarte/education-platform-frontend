import { EntityName } from '@/shared/utils'

const STUDENT_PROFILE_NAME = new EntityName({ gender: 'X', plural: 'estudiantes', singular: 'estudiante' })
const SCHOOL_STAFF_PROFILE_NAME = new EntityName({
  gender: 'M',
  plural: 'responsables institucionales',
  singular: 'responsable institucional',
})

const EXECUTIVE_PROFILE_NAME = new EntityName({
  gender: 'M',
  plural: 'responsables ejecutivos',
  singular: 'responsable ejecutivo',
})

const SCHOOL_NAME = new EntityName({ gender: 'F', plural: 'escuelas', singular: 'escuela' })

enum SchoolGrade {
  G_1 = '1',
  G_2 = '2',
  G_3 = '3',
  G_4 = '4',
  G_5 = '5',
  G_6 = '6',
  G_7 = '7',
  G_8 = '8',
  G_9 = '9',
  G_10 = '10',
  G_11 = '11',
  G_12 = '12',
}
export { STUDENT_PROFILE_NAME, SCHOOL_NAME, SCHOOL_STAFF_PROFILE_NAME, EXECUTIVE_PROFILE_NAME, SchoolGrade }
