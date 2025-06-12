import { T_AnswerType, T_AnswerTypeUrlParams } from '@/mta_evaluations/types'
import { EntityName } from '@/shared/utils'

const EVALUATION_NAME = new EntityName({ gender: 'F', singular: 'evaluación', plural: 'evaluaciones' })
const EVALUATION_PAGE_NAME = new EntityName({ gender: 'F', singular: 'página de evaluación', plural: 'páginas de evaluación' })
const EVALUATOR_PROFILE_NAME = new EntityName({ gender: 'M', singular: 'itemista', plural: 'itemistas' })
const QUESTION_NAME = new EntityName({ gender: 'F', singular: 'pregunta', plural: 'preguntas' })
const MULTIPLE_CHOICE_NAME = new EntityName({
  gender: 'F',
  plural: 'preguntas de opción múltiple',
  singular: 'pregunta de opción múltiple',
})
const NUMERIC_NAME = new EntityName({ gender: 'F', plural: 'preguntas numérica', singular: 'pregunta numérica' })


const answerTypesToUrlPaths: Record<T_AnswerType, T_AnswerTypeUrlParams> = {
  MultipleChoice: 'multiple-choice',
  Numeric: 'numerica',
}
const urlPathsToAnswerTypes: Record<T_AnswerTypeUrlParams, T_AnswerType> = {
  'multiple-choice': 'MultipleChoice',
  numerica: 'Numeric',
}

export {
  EVALUATION_NAME,
  EVALUATION_PAGE_NAME,
  QUESTION_NAME,
  MULTIPLE_CHOICE_NAME,
  NUMERIC_NAME,
  EVALUATOR_PROFILE_NAME,
  answerTypesToUrlPaths,
  urlPathsToAnswerTypes,
}
