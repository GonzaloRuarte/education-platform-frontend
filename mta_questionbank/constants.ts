import { T_AnswerType, T_AnswerTypeUrlParams } from '@/mta_questionbank/types'
import { EntityName } from '@/shared/utils'

const QUESTION_NAME = new EntityName({ gender: 'F', singular: 'pregunta', plural: 'preguntas' })
const MULTIPLE_CHOICE_NAME = new EntityName({
  gender: 'F',
  plural: 'preguntas de opción múltiple',
  singular: 'pregunta de opción múltiple',
})
const NUMERIC_NAME = new EntityName({ gender: 'F', plural: 'preguntas numérica', singular: 'pregunta numérica' })
const OPEN_ENDED_NAME = new EntityName({ gender: 'F', plural: 'preguntas de texto libre', singular: 'pregunta de texto libre' })

const answerTypesToUrlPaths: Record<T_AnswerType, T_AnswerTypeUrlParams> = {
  MultipleChoiceTemplate: 'multiple-choice',
  NumericTemplate: 'numerica',
  OpenEndedTemplate: 'texto-libre',
}
const urlPathsToAnswerTypes: Record<T_AnswerTypeUrlParams, T_AnswerType> = {
  'multiple-choice': 'MultipleChoiceTemplate',
  'numerica': 'NumericTemplate',
  'texto-libre': 'OpenEndedTemplate',
}

export {
  QUESTION_NAME,
  MULTIPLE_CHOICE_NAME,
  NUMERIC_NAME,
  OPEN_ENDED_NAME,
  answerTypesToUrlPaths,
  urlPathsToAnswerTypes,
}
