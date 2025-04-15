'use client'

import { useMultipleChoiceOptionCreate } from '@/mta_evaluations/hooks'
import { multipleChoiceLabels } from '@/mta_evaluations/labels'
import { I_MultipleChoiceOptionCreateRequestData, T_MultiplChoiceId } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import InputControlled from '@/shared/forms/InputControlled'
import { LetterSelectControlled } from '@/shared/forms/LetterSelect'
import { rules } from '@/shared/forms/messages'
import WysiwygEditorControlled from '@/shared/forms/WysiwygEditorControlled'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { T_VoidFn } from '@/shared/types'
import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_MultipleChoiceOptionCreateRequestData, 'multiple_choice_id'> {}

const defaultValues: I_FormFields = {
  name: '',
  content: '',
  is_true: false,
}
const OptionCreateForm: FC<{ multipleChoiceId: T_MultiplChoiceId; reload: T_VoidFn }> = ({
  multipleChoiceId,
  reload,
}) => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })

  const { setInProgressStatus } = useInProgress()

  const create = useMultipleChoiceOptionCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setInProgressStatus(true)
    create({ multiple_choice_id: multipleChoiceId, ...data })
      .then((res) => {
        log.info('New Option added:', res)
        successToast('Opción agregada correctamente')
      })
      .catch(handleServiceError)
      .finally(() => {
        setInProgressStatus(false)
        reload()
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <LetterSelectControlled control={control} name="name" rules={{ ...rules.required() }} />
        <WysiwygEditorControlled<I_FormFields>
          {...{ control }}
          label={multipleChoiceLabels.option.content}
          rules={{ ...rules.required() }}
          name="content"
        />
      </MagicGrid>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default OptionCreateForm
