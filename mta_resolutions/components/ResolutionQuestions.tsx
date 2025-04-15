import { T_AnswerType, T_QuestionId } from '@/mta_evaluations/types'
import { useResolutionPagination } from '@/mta_resolutions/hooks'
import { useResolutionState, useResolutionStateUpdateAnswer } from '@/mta_resolutions/hooks/data'
import {
  I_EvaluationToResolve,
  T_EvaluationToResolve_MultipleChoiceAnswer,
  T_EvaluationToResolve_NumericAnswer,
  T_ResolutionState_MultipleChoiceAnswerData,
  T_ResolutionState_NumericAnswerData,
} from '@/mta_resolutions/types'
import Chip from '@/shared/components/Chip'
import Spacer from '@/shared/components/Spacer'
import { H4 } from '@/shared/components/Typography'
import Input from '@/shared/forms/Input'

import { Checkbox, FormControl, FormControlLabel, Grid2 as Grid, Radio } from '@mui/material'
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
          updateNumeric(questionId, data.id, Number(e.target.value))
        }}
      />
    </>
  )
}
const MultipleChoiceForm: FC<{ data: T_EvaluationToResolve_MultipleChoiceAnswer; questionId: T_QuestionId }> = ({
  data,
  questionId,
}) => {
  const resolutionState = useResolutionState()
  const { updateMultipleChoice } = useResolutionStateUpdateAnswer()
  const specific_data = resolutionState?.answers[questionId]?.specific_data as
    | T_ResolutionState_MultipleChoiceAnswerData['specific_data']
    | undefined
  const handleCbChange = (name: string, checked: boolean) => {
    if (checked && specific_data?.choosed_options?.includes(name)) return
    if (!checked && !specific_data?.choosed_options?.includes(name)) return

    const checkedOption = () => {
      const newChosenOptions = specific_data?.choosed_options?.map((i) => i) || []
      newChosenOptions.push(name)
      return newChosenOptions
    }
    const uncheckedOption = () => {
      return specific_data?.choosed_options.filter((i) => i !== name) || []
    }
    updateMultipleChoice(questionId, data.id, checked ? checkedOption() : uncheckedOption())
  }
  const handleRadioChange = (name: string, _: boolean) => {
    updateMultipleChoice(questionId, data.id, [name])
  }

  return (
    <FormControl>
      {data.specific_data.options.map((option) => {
        return (
          <Fragment key={`answer_${data.id}-option_${option.id}`}>
            <FormControlLabel
              value={option.content}
              control={
                data.specific_data.is_multiselect ? (
                  <Checkbox
                    onChange={(_, checked) => {
                      handleCbChange(option.name, checked)
                    }}
                    checked={specific_data?.choosed_options?.includes(option.name) || false}
                  />
                ) : (
                  <Radio
                    onChange={(_, checked) => {
                      handleRadioChange(option.name, checked)
                    }}
                    checked={specific_data?.choosed_options?.includes(option.name) || false}
                  />
                )
              }
              label={
                <Grid spacing={2} component="div" container justifyContent="center" alignItems="center">
                  <Grid>
                    <Chip label={option.name} />
                  </Grid>
                  <Grid>{option.content}</Grid>
                </Grid>
              }
            />
          </Fragment>
        )
      })}
    </FormControl>
  )
}
const forms: Record<T_AnswerType, FC<any>> = {
  MultipleChoice: MultipleChoiceForm,
  Numeric: NumericForm,
}
const ResolutionQuestions: FC<{ evaluationToResolve: I_EvaluationToResolve }> = ({ evaluationToResolve }) => {
  // console.log('evaluationToResolve', evaluationToResolve)

  const { currentPage } = useResolutionPagination()
  // console.log({ currentPage })

  const questions = evaluationToResolve.pages[currentPage - 1]
  // console.log('questions >>>>>>>>>>>>', questions)
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
