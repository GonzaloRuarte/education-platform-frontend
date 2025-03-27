import { T_AnswerType } from '@/mta_evaluations/types'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import {
  I_EvaluationToResolve,
  T_EvaluationToResolve_MultipleChoiceAnswer,
  T_EvaluationToResolve_NumericAnswer,
} from '@/mta_resolutions/types'
import Chip from '@/shared/components/Chip'
import Spacer from '@/shared/components/Spacer'
import { H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'
import { parseHtml } from '@/shared/htmlParser'

import { Box, Checkbox, Grid2 as Grid, Radio } from '@mui/material'
import { FC, Fragment } from 'react'

const NumericForm: FC<{ data: T_EvaluationToResolve_NumericAnswer }> = ({ data }) => {
  return (
    <>
      <Input type="number" name={String(data.id)} label="Respuesta" />
    </>
  )
}
const MultipleChoiceForm: FC<{ data: T_EvaluationToResolve_MultipleChoiceAnswer }> = ({ data }) => {
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
const ResolutionQuestions: FC<{ evaluationToResolve: I_EvaluationToResolve }> = ({ evaluationToResolve }) => {
  const { currentPage } = useResolutionPagination()
  const questions = evaluationToResolve.evaluation_data.pages[currentPage - 1]

  return (
    <>
      {questions.map((question) => {
        const AnswerForm = forms[question.answer.resource_type]
        return (
          <Fragment key={question.id}>
            <H4>
              {question.content}
              {question.is_mandatory && <sup style={{ fontSize: 10 }}> (obligatoria)</sup>}
            </H4>
            <Spacer size="s" />
            <AnswerForm data={question.answer} />
            <Spacer size="xl" />
          </Fragment>
        )
      })}
    </>
  )
}

export default ResolutionQuestions
