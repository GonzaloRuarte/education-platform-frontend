'use client'

import { useNavigateToEvaluationContentEdit, useQuestionNumericUpdate } from '@/mta_evaluations/hooks'
import { numericLabels, questionLabels } from '@/mta_evaluations/labels'
import { I_AnswerNumericDetail, I_QuestionUpdateNumericRequestData, T_QuestionForm } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends I_QuestionUpdateNumericRequestData {}

const NumericEditForm: T_QuestionForm<I_AnswerNumericDetail> = ({data, reload }) => {
  const { content, page_id, answer } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      value: answer.value,
    },
  })

  const { setInProgressStatus } = useInProgress()
  const backToDetail = useNavigateToEvaluationContentEdit()
  const update = useQuestionNumericUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setInProgressStatus(true)
    update(data.id, { ...updatedData })
      .then(() => {
        log.info('Question edited succesfully:')
        successToast('Pregunta editada correctamente')
        backToDetail({ evaluationId: evaluation_id })
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
      })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={questionLabels.content}
          rules={{ ...rules.required() }}
          name="content"
        />
        <InputControlled<I_FormFields>
          {...{ control }}
          label={numericLabels.value}
          rules={{ ...rules.required() }}
          name="value"
          type="number"
        />
      </MagicGrid>
      <Spacer />

      <Submit>{sharedLabels.update}</Submit>
    </form>
  )
}

export default NumericEditForm
