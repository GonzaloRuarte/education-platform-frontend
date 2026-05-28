import { EntityName } from '@/shared/utils'

const EVALUATION_NAME = new EntityName({ gender: 'F', singular: 'evaluación', plural: 'evaluaciones' })
const EVALUATION_PAGE_NAME = new EntityName({ gender: 'F', singular: 'página de evaluación', plural: 'páginas de evaluación' })
const EVALUATION_SUBJECT_NAME = new EntityName({ gender: 'F', singular: 'materia', plural: 'materias' })
const EVALUATOR_PROFILE_NAME = new EntityName({ gender: 'M', singular: 'itemista', plural: 'itemistas' })
const QUESTION_NAME = new EntityName({ gender: 'F', singular: 'pregunta', plural: 'preguntas' })
const MULTIPLE_CHOICE_NAME = new EntityName({
  gender: 'F',
  plural: 'preguntas de opción múltiple',
  singular: 'pregunta de opción múltiple',
})
const NUMERIC_NAME = new EntityName({ gender: 'F', plural: 'preguntas numérica', singular: 'pregunta numérica' })
const OPEN_ENDED_NAME = new EntityName({ gender: 'F', plural: 'preguntas de texto libre', singular: 'pregunta de texto libre' })


export {
  EVALUATION_NAME,
  EVALUATION_PAGE_NAME,
  EVALUATION_SUBJECT_NAME,
  QUESTION_NAME,
  MULTIPLE_CHOICE_NAME,
  NUMERIC_NAME,
  OPEN_ENDED_NAME,
  EVALUATOR_PROFILE_NAME,
}
