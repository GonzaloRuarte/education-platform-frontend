'use client'

import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  I_QuestionCreateMultipleChoiceRequestData,
  T_EvaluationPageId,
} from '@/mta_evaluations/types'
import {
  useQuestionMultipleChoiceCreate,
} from '@/mta_evaluations/hooks'
import { questionLabels } from '@/mta_evaluations/labels'

import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { rules } from '@/shared/forms/messages'
import { useInProgress } from '@/shared/hooks'
import { sharedLabels } from '@/shared/labels'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { Body1 } from '@/shared/components/Typography'
import Button from '@/shared/components/Button'

interface I_FormFields
  extends Omit<I_QuestionCreateMultipleChoiceRequestData, 'page_id'> {}

interface Props {
  page_id: T_EvaluationPageId
  onSuccess: () => void
  onCancel?: () => void
}

const MultipleChoiceCreateForm: FC<Props> = ({ page_id, onSuccess, onCancel }) => {
  const { handleSubmit, control } = useForm<I_FormFields>({
    defaultValues: { content: '' },
  })

  const { setInProgressStatus } = useInProgress()
  const create = useQuestionMultipleChoiceCreate()

  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create({ ...data, page_id })
      .then(() => {
        log.info('Multiple-choice question created')
        successToast('Pregunta de opción múltiple agregada correctamente')
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
          name="content"
          label={questionLabels.content}
          rules={{ ...rules.required() }}
        />
      </MagicGrid>

      <Spacer />

      <MagicGrid itemSize="auto">
        <Submit>{sharedLabels.add}</Submit>
        {onCancel && (
          <Button variant="text" onClick={onCancel}>
            {sharedLabels.cancel}
          </Button>
        )}
        <Body1>
          Nota: Una vez creado el encabezado de la pregunta, podrá agregar opciones.
        </Body1>
      </MagicGrid>
    </form>
  )
}

export default MultipleChoiceCreateForm
