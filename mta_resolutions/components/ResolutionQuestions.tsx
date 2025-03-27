import { T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import { useResolutionPagination, useResolutionState, useResolutionStateUpdateAnswer } from '@/mta_resolutions/hooks'
import {
  I_ResumeResolutionResponse,
  T_EvaluationToResolve_MultipleChoiceAnswer,
  T_EvaluationToResolve_NumericAnswer,
  T_ResolutionState_NumericAnswerData,
} from '@/mta_resolutions/types'
import Chip from '@/shared/components/Chip'
import Spacer from '@/shared/components/Spacer'
import { H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { parseHtml } from '@/shared/htmlParser'

import { Checkbox, Grid2 as Grid, Radio } from '@mui/material'
import { FC, Fragment } from 'react'

const NumericForm: FC<{ data: T_EvaluationToResolve_NumericAnswer; questionId: T_QuestionId }> = ({
  data,
  questionId,
}) => {
  const resolutionState = useResolutionState()
  const { updateNumeric } = useResolutionStateUpdateAnswer()

  const specific_data = resolutionState?.answers[questionId]?.specific_data as
    | T_ResolutionState_NumericAnswerData['specific_data']
    | undefined
  return (
    <>
      <Input
        type="number"
        name={String(data.id)}
        label="Respuesta"
        value={specific_data?.value === undefined ? '' : specific_data.value}
        onChange={(e) => {
          updateNumeric(questionId, data.id, e.target.value)
        }}
      />
    </>
  )
}
const MultipleChoiceForm: FC<{ data: T_EvaluationToResolve_MultipleChoiceAnswer; questionId: T_QuestionId }> = ({
  data,
  questionId,
}) => {
  return (
    <>
      {data.specific_data.options.map((option) => {
        return (
          <Fragment key={`answer_${data.id}-option_${option.id}`}>
            <Grid spacing={1} component="div" container justifyContent="center" alignItems="center">
              <Grid>{data.specific_data.is_multiselect ? <Checkbox /> : <Radio />}</Grid>
              <Grid size="auto">
                <Chip label={option.name} />
              </Grid>
              <Grid size="grow">{parseHtml(option.content)}</Grid>
            </Grid>
          </Fragment>
        )
      })}
    </>
  )
}
const forms: Record<T_AnswerType, FC<any>> = {
  MultipleChoice: MultipleChoiceForm,
  Numeric: NumericForm,
}
const ResolutionQuestions: FC<{ evaluationToResolve: I_ResumeResolutionResponse }> = ({ evaluationToResolve }) => {
  const { currentPage } = useResolutionPagination()
  const questions = evaluationToResolve.evaluation_data.pages[currentPage - 1]

  return (
    <>
      {questions.map((question) => {
        const AnswerForm = forms[question.answer.resource_type]
        return (
          <Fragment key={question.id}>
            <H4>
              {question.order + 1}. {question.content}
              {question.is_mandatory && <sup style={{ fontSize: 10 }}> (obligatoria)</sup>}
            </H4>
            <Spacer size="s" />
            <AnswerForm data={question.answer} questionId={question.id} />
            <Spacer size="xl" />
          </Fragment>
        )
      })}
    </>
  )
}

export default ResolutionQuestions
