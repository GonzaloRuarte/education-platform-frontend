'use client'

import { useMultipleChoiceOptionCreate, useNavigateToEvaluationContentEdit } from '@/mta_evaluations/hooks'
import { multipleChoiceLabels } from '@/mta_evaluations/labels'
import { I_MultipleChoiceOptionCreateRequestData, T_MultiplChoiceId } from '@/mta_evaluations/types'
import MagicGrid from '@/shared/components/MagicGrid'
import Spacer from '@/shared/components/Spacer'
import Submit from '@/shared/components/Submit'
import Input from '@/shared/forms/Input'
import { rules } from '@/shared/forms/messages'
import WysiwygEditor from '@/shared/forms/WysiwygEditor'
import { useInProgress } from '@/shared/hooks'
import log from '@/shared/log'
import { handleServiceError } from '@/shared/service'
import { successToast } from '@/shared/toasts'
import { FC } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

interface I_FormFields extends Omit<I_MultipleChoiceOptionCreateRequestData, 'multiple_choice_id'> {}

const defaultValues: I_FormFields = {
  name: '',
  content: '',
  is_true: false,
}
const OptionCreateForm: FC<{ multipleChoiceId: T_MultiplChoiceId }> = ({ multipleChoiceId }) => {
  const { handleSubmit, control } = useForm<I_FormFields>({ defaultValues })

  const { setIsInProgress } = useInProgress()

  const create = useMultipleChoiceOptionCreate()
  const onSubmit: SubmitHandler<I_FormFields> = (data) => {
    setIsInProgress(true)
    create({ multiple_choice_id: multipleChoiceId, ...data })
      .then((res) => {
        log.info('New Ooption added:', res)
        successToast('Opción agregada correctamente')
      })
      .catch(handleServiceError)
      .finally(() => {
        setIsInProgress(false)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MagicGrid>
        <Input<I_FormFields> {...{ control }} name="name" rules={{ ...rules.required() }} label={multipleChoiceLabels.option.name} />
        <WysiwygEditor<I_FormFields> {...{ control }} label={multipleChoiceLabels.option.content} rules={{ ...rules.required() }} name="content" />
      </MagicGrid>
      <Spacer />

      <Submit>Agregar</Submit>
    </form>
  )
}

export default OptionCreateForm
