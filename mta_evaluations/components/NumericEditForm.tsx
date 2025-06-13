'use client'

import { useQuestionNumericUpdate } from '@/mta_evaluations/hooks'
import { numericLabels, questionLabels } from '@/mta_evaluations/labels'
import { I_AnswerNumericDetail, I_QuestionUpdateNumericRequestData, T_QuestionForm } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Button from '@/shared/components/Button'
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

const NumericEditForm: T_QuestionForm<I_AnswerNumericDetail> = ({ data, onSuccess, onCancel }) => {
  const { content, answer } = data

  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: {
      content,
      value: answer.value,
    },
  })

  const { setInProgressStatus } = useInProgress()

  const update = useQuestionNumericUpdate()
  const onSubmit: SubmitHandler<I_FormFields> = (updatedData) => {
    setInProgressStatus(true)
    update(data.id, { ...updatedData })
      .then(() => {
        log.info('Numeric question created')
        successToast('Pregunta numérica editada correctamente')
        onSuccess()
      })
      .catch(handleServiceError)
      .finally(() => setInProgressStatus(false))
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

      <MagicGrid itemSize="auto">
        <Submit>{sharedLabels.update}</Submit>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            {sharedLabels.cancel}
          </Button>
        )}
      </MagicGrid>
    </form>
  )
}

export default NumericEditForm
