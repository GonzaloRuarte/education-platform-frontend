import { SchoolGrade } from '@/mta_schools/constants'

const GRADE = 'Grado/Año'

const schoolLabels = {
  loading: 'Cargando escuelas...',
  chooseSchool: 'Elegí una escuela',
  grade: GRADE,
  chooseGrade: `Elegí un ${GRADE}`,
}
const gradeLabel = (grade: SchoolGrade) => `${schoolLabels.grade} ${grade}º`

export { schoolLabels, gradeLabel }
